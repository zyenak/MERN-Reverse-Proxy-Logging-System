import { Request, Response } from 'express';
import proxyRuleService from '@/services/proxyRuleService';
import logger from '@/utils/logger';
import { CreateProxyRuleRequest, UpdateProxyRuleRequest } from '@/types';

export const getAllProxyRules = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const result = await proxyRuleService.getAllRulesPaginated(page, limit, search);
    logger.info('All proxy rules fetched successfully', { page, limit, total: result.total });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching proxy rules:', error);
    res.status(500).json({ message: 'Error fetching proxy rules', error });
  }
};

export const getProxyRuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = await proxyRuleService.getRuleById(id);
    
    if (!rule) {
      return res.status(404).json({ message: 'Proxy rule not found' });
    }
    
    logger.info('Proxy rule fetched successfully', { ruleId: id });
    res.json(rule);
  } catch (error) {
    logger.error('Error fetching proxy rule:', error);
    res.status(500).json({ message: 'Error fetching proxy rule', error });
  }
};

export const createProxyRule = async (req: Request, res: Response) => {
  try {
    const ruleData: CreateProxyRuleRequest = req.body;
    
    // Validate pattern format
    if (!ruleData.pattern.startsWith('/')) {
      return res.status(400).json({ message: 'Pattern must start with /' });
    }
    
    // Map validation interface fields to Mongoose model fields
    const mongooseRuleData = {
      name: ruleData.name,
      path: ruleData.pattern, // Map 'pattern' to 'path'
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Default methods
      loggingEnabled: true, // Default to true
      isBlocked: ruleData.isBlocking, // Map 'isBlocking' to 'isBlocked'
      forwardTarget: ruleData.forwardTarget,
      priority: ruleData.priority || 0,
      enabled: true // Default to enabled
    };
    
    const rule = await proxyRuleService.createRule(mongooseRuleData);
    logger.info('Proxy rule created successfully', { ruleId: rule._id });
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Error creating proxy rule:', error);
    res.status(500).json({ message: 'Error creating proxy rule', error });
  }
};

export const updateProxyRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateProxyRuleRequest = req.body;
    
    // Map validation interface fields to Mongoose model fields
    const mongooseUpdates: any = {};
    
    if (updates.name !== undefined) mongooseUpdates.name = updates.name;
    if (updates.pattern !== undefined) mongooseUpdates.path = updates.pattern; // Map 'pattern' to 'path'
    if (updates.forwardTarget !== undefined) mongooseUpdates.forwardTarget = updates.forwardTarget;
    if (updates.isBlocking !== undefined) mongooseUpdates.isBlocked = updates.isBlocking; // Map 'isBlocking' to 'isBlocked'
    if (updates.isEnabled !== undefined) mongooseUpdates.enabled = updates.isEnabled; // Map 'isEnabled' to 'enabled'
    if (updates.loggingEnabled !== undefined) mongooseUpdates.loggingEnabled = updates.loggingEnabled; // Direct mapping
    if (updates.priority !== undefined) mongooseUpdates.priority = updates.priority;
    
    const rule = await proxyRuleService.updateRule(id, mongooseUpdates);
    
    if (!rule) {
      return res.status(404).json({ message: 'Proxy rule not found' });
    }
    
    logger.info('Proxy rule updated successfully', { ruleId: id, updates });
    res.json(rule);
  } catch (error) {
    logger.error('Error updating proxy rule:', error);
    res.status(500).json({ message: 'Error updating proxy rule', error });
  }
};

export const deleteProxyRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await proxyRuleService.deleteRule(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Proxy rule not found' });
    }
    
    logger.info('Proxy rule deleted successfully', { ruleId: id });
    res.json({ message: 'Proxy rule deleted successfully' });
  } catch (error) {
    logger.error('Error deleting proxy rule:', error);
    res.status(500).json({ message: 'Error deleting proxy rule', error });
  }
};

export const resetProxyRules = async (_req: Request, res: Response) => {
  try {
    await proxyRuleService.resetToDefaults();
    logger.info('Proxy rules reset successfully');
    res.json({ message: 'Proxy rules reset to defaults successfully' });
  } catch (error) {
    logger.error('Error resetting proxy rules:', error);
    res.status(500).json({ message: 'Error resetting proxy rules', error });
  }
}; 