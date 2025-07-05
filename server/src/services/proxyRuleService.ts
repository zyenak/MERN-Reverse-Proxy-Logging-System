import ProxyRule, { IProxyRule } from '@/models/ProxyRule';
import logger from '@/utils/logger';

export class ProxyRuleService {
  private static instance: ProxyRuleService;
  private cachedRule: IProxyRule | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ProxyRuleService {
    if (!ProxyRuleService.instance) {
      ProxyRuleService.instance = new ProxyRuleService();
    }
    return ProxyRuleService.instance;
  }

  private isCacheValid(): boolean {
    return this.cachedRule !== null && Date.now() < this.cacheExpiry;
  }

  private setCache(rule: IProxyRule): void {
    this.cachedRule = rule;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  private clearCache(): void {
    this.cachedRule = null;
    this.cacheExpiry = 0;
  }

  public async getOrCreateProxyRule(): Promise<IProxyRule> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        return this.cachedRule!;
      }

      // Fetch from database
      let rule = await ProxyRule.findOne();
      
      if (!rule) {
        rule = await ProxyRule.create({ enabled: true, whitelist: [] });
        logger.info('Created new proxy rule with default settings');
      }

      this.setCache(rule);
      return rule;
    } catch (error) {
      logger.error('Error in getOrCreateProxyRule:', error);
      throw error;
    }
  }

  public async updateProxyRule(updates: Partial<IProxyRule>): Promise<IProxyRule> {
    try {
      let rule = await ProxyRule.findOne();
      
      if (!rule) {
        rule = await ProxyRule.create({ enabled: true, whitelist: [], ...updates });
        logger.info('Created new proxy rule with updates');
      } else {
        Object.assign(rule, updates);
        await rule.save();
        logger.info('Updated existing proxy rule');
      }

      this.clearCache(); // Clear cache after update
      return rule;
    } catch (error) {
      logger.error('Error in updateProxyRule:', error);
      throw error;
    }
  }

  public async resetProxyRule(): Promise<IProxyRule> {
    try {
      await ProxyRule.deleteMany({});
      const rule = await ProxyRule.create({ enabled: true, whitelist: [] });
      this.clearCache(); // Clear cache after reset
      logger.info('Reset proxy rule to default settings');
      return rule;
    } catch (error) {
      logger.error('Error in resetProxyRule:', error);
      throw error;
    }
  }

  public async isRequestAllowed(url: string): Promise<boolean> {
    try {
      const rule = await this.getOrCreateProxyRule();
      
      if (!rule.enabled) {
        return false;
      }

      if (rule.whitelist.length === 0) {
        return true; // No whitelist means all paths are allowed
      }

      return rule.whitelist.some((path) => url.startsWith(path));
    } catch (error) {
      logger.error('Error checking if request is allowed:', error);
      return false; // Default to blocking on error
    }
  }
}

export default ProxyRuleService.getInstance(); 