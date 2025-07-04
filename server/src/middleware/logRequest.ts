import { Request, Response, NextFunction } from 'express';
import Log from '../models/Log';
import ProxyRule from '../models/ProxyRule';
import { AuthRequest } from './auth';

export const logRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl;

  // Check proxy rules
  const rule = await ProxyRule.findOne();
  if (!rule || !rule.enabled) return next();
  if (rule.whitelist.length > 0 && !rule.whitelist.some((path) => url.startsWith(path))) return next();

  res.on('finish', async () => {
    const responseTime = Date.now() - start;
    try {
      await Log.create({
        method,
        url,
        timestamp: new Date(),
        status: res.statusCode,
        user: req.user ? req.user.username : undefined,
        responseTime,
      });
    } catch (err) {
      // Optionally log error
    }
  });
  next();
}; 