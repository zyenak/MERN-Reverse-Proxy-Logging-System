import { Request, Response } from 'express';
import ProxyRule from '../models/ProxyRule';

export const getProxyRule = async (_req: Request, res: Response) => {
  try {
    let rule = await ProxyRule.findOne();
    if (!rule) {
      rule = await ProxyRule.create({ enabled: true, whitelist: [] });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proxy rule', error });
  }
};

export const updateProxyRule = async (req: Request, res: Response) => {
  try {
    const { enabled, whitelist } = req.body;
    let rule = await ProxyRule.findOne();
    if (!rule) {
      rule = await ProxyRule.create({ enabled, whitelist });
    } else {
      if (enabled !== undefined) rule.enabled = enabled;
      if (whitelist !== undefined) rule.whitelist = whitelist;
      await rule.save();
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating proxy rule', error });
  }
};

export const resetProxyRule = async (_req: Request, res: Response) => {
  try {
    await ProxyRule.deleteMany({});
    const rule = await ProxyRule.create({ enabled: true, whitelist: [] });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting proxy rule', error });
  }
}; 