import { Request, Response } from 'express';
import proxyRuleService from '../services/proxyRuleService';
import logger from '../utils/logger';
import { UpdateProxyRuleInput } from '../utils/validation';

export const getProxyRule = async (_req: Request, res: Response) => {
  try {
    const rule = await proxyRuleService.getOrCreateProxyRule();
    logger.info('Proxy rule fetched successfully');
    res.json(rule);
  } catch (error) {
    logger.error('Error fetching proxy rule:', error);
    res.status(500).json({ message: 'Error fetching proxy rule', error });
  }
};

export const updateProxyRule = async (req: Request, res: Response) => {
  try {
    const updates: UpdateProxyRuleInput = req.body;
    const rule = await proxyRuleService.updateProxyRule(updates);
    logger.info('Proxy rule updated successfully', { updates });
    res.json(rule);
  } catch (error) {
    logger.error('Error updating proxy rule:', error);
    res.status(500).json({ message: 'Error updating proxy rule', error });
  }
};

export const resetProxyRule = async (_req: Request, res: Response) => {
  try {
    const rule = await proxyRuleService.resetProxyRule();
    logger.info('Proxy rule reset successfully');
    res.json(rule);
  } catch (error) {
    logger.error('Error resetting proxy rule:', error);
    res.status(500).json({ message: 'Error resetting proxy rule', error });
  }
}; 