import { Request, Response, NextFunction } from 'express';
import Log from '@/models/Log';
import proxyRuleService from '@/services/proxyRuleService';
import logger from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

export const logRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl;

  try {
    // Check if request should be logged using new service method
    const shouldLog = await proxyRuleService.shouldLogRequest(url, method);
    if (!shouldLog) {
      next();
      return;
    }

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
        
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('Request logged', {
            method,
            url,
            status: res.statusCode,
            responseTime,
            user: req.user?.username
          });
        }
      } catch (err) {
        logger.error('Error logging request:', err);
      }
    });
  } catch (error) {
    logger.error('Error in logRequest middleware:', error);
    // Continue processing even if logging fails
  }
  
  next();
}; 