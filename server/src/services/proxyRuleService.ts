import ProxyRule, { IProxyRule } from '@/models/ProxyRule';
import logger from '@/utils/logger';

export class ProxyRuleService {
  private cachedRules: IProxyRule[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(): boolean {
    return this.cachedRules.length > 0 && Date.now() < this.cacheExpiry;
  }

  private setCache(rules: IProxyRule[]): void {
    this.cachedRules = rules;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  private clearCache(): void {
    this.cachedRules = [];
    this.cacheExpiry = 0;
  }

  public async getAllRules(): Promise<IProxyRule[]> {
    try {
      if (this.isCacheValid()) {
        return this.cachedRules;
      }

      const rules = await ProxyRule.find()
        .sort({ priority: -1, createdAt: -1 })
        .exec();

      this.setCache(rules);
      return rules;
    } catch (error) {
      logger.error('Error fetching proxy rules:', error);
      throw error;
    }
  }

  public async getEnabledRules(): Promise<IProxyRule[]> {
    try {
      const rules = await ProxyRule.find({ enabled: true })
        .sort({ priority: -1, createdAt: -1 })
        .exec();
      return rules;
    } catch (error) {
      logger.error('Error fetching enabled proxy rules:', error);
      throw error;
    }
  }

  public async getAllRulesPaginated(page: number, limit: number, search?: string): Promise<{ rules: IProxyRule[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { path: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await ProxyRule.countDocuments(query);
      
      // Get paginated results
      const rules = await ProxyRule.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return { rules, total };
    } catch (error) {
      logger.error('Error fetching paginated proxy rules:', error);
      throw error;
    }
  }

  public async createRule(ruleData: Partial<IProxyRule>): Promise<IProxyRule> {
    try {
      const rule = await ProxyRule.create(ruleData);
      this.clearCache();
      logger.info(`Created new proxy rule: ${rule.name}`);
      return rule;
    } catch (error) {
      logger.error('Error creating proxy rule:', error);
      throw error;
    }
  }

  public async updateRule(ruleId: string, updates: Partial<IProxyRule>): Promise<IProxyRule | null> {
    try {
      const rule = await ProxyRule.findByIdAndUpdate(
        ruleId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (rule) {
        this.clearCache();
        logger.info(`Updated proxy rule: ${rule.name}`);
      }
      
      return rule;
    } catch (error) {
      logger.error('Error updating proxy rule:', error);
      throw error;
    }
  }

  public async deleteRule(ruleId: string): Promise<boolean> {
    try {
      const result = await ProxyRule.findByIdAndDelete(ruleId);
      if (result) {
        this.clearCache();
        logger.info(`Deleted proxy rule: ${result.name}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting proxy rule:', error);
      throw error;
    }
  }

  public async getRuleById(ruleId: string): Promise<IProxyRule | null> {
    try {
      return await ProxyRule.findById(ruleId);
    } catch (error) {
      logger.error('Error fetching proxy rule by ID:', error);
      throw error;
    }
  }

  public async findMatchingRule(url: string, method: string, enabledOnly: boolean = true): Promise<IProxyRule | null> {
    try {
      const rules = enabledOnly ? await this.getEnabledRules() : await this.getAllRules();
      
      // Extract path from URL - handle both full URLs and paths
      let pathname: string;
      try {
        // If it's a full URL, extract the path
        if (url.startsWith('http://') || url.startsWith('https://')) {
          pathname = new URL(url).pathname;
        } else {
          // If it's already a path, use it directly
          pathname = url;
        }
      } catch {
        // Fallback to treating as path
        pathname = url;
      }
      
      // Find the first matching rule (highest priority first)
      const matchingRule = rules.find(rule => {
        // Simple startsWith matching for paths
        const pathMatches = pathname.startsWith(rule.path);
        const methodMatches = rule.methods.includes(method.toUpperCase());
        return pathMatches && methodMatches;
      });

      return matchingRule || null;
    } catch (error) {
      logger.error('Error finding matching proxy rule:', error);
      return null;
    }
  }

  public async shouldBlockRequest(url: string, method: string): Promise<boolean> {
    try {
      const matchingRule = await this.findMatchingRule(url, method, true); // Only check enabled rules
      return matchingRule ? matchingRule.isBlocked : false;
    } catch (error) {
      logger.error('Error checking if request should be blocked:', error);
      return false; // Default to allowing on error
    }
  }

  public async shouldLogRequest(url: string, method: string): Promise<boolean> {
    try {
      const matchingRule = await this.findMatchingRule(url, method, true); // Only check enabled rules
      return matchingRule ? matchingRule.loggingEnabled : true; // Default to logging
    } catch (error) {
      logger.error('Error checking if request should be logged:', error);
      return true; // Default to logging on error
    }
  }

  public async getForwardTarget(url: string, method: string): Promise<string | null> {
    try {
      const matchingRule = await this.findMatchingRule(url, method);
      return matchingRule?.forwardTarget || null;
    } catch (error) {
      logger.error('Error getting forward target:', error);
      return null;
    }
  }

  public async resetToDefaults(): Promise<void> {
    try {
      await ProxyRule.deleteMany({});
      
      // Create default rules
      await ProxyRule.create([
        {
          name: 'Default API Access',
          path: '/api',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          loggingEnabled: true,
          isBlocked: false,
          priority: 0,
          enabled: true
        },
        {
          name: 'Block Sensitive Endpoints',
          path: '/api/admin',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          loggingEnabled: true,
          isBlocked: true,
          priority: 10,
          enabled: true
        }
      ]);

      this.clearCache();
      logger.info('Reset proxy rules to default settings');
    } catch (error) {
      logger.error('Error resetting proxy rules:', error);
      throw error;
    }
  }
}

export default new ProxyRuleService(); 