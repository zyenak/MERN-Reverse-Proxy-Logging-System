import { Request, Response } from 'express';
import axios from 'axios';
import proxyRuleService from '@/services/proxyRuleService';
import Log from '@/models/Log';
import logger from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

const TARGET_API = 'https://jsonplaceholder.typicode.com';

export const handleProxy = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now();
  const originalUrl = req.originalUrl;
  const method = req.method.toUpperCase();
  
  // Extract actual path from proxy route - handle both parameter and direct path
  let actualPath: string;
  if (req.params.path) {
    // If using parameter-based routing
    actualPath = req.params.path.startsWith('/') ? req.params.path : `/${req.params.path}`;
  } else {
    // If using direct path replacement
    actualPath = originalUrl.replace('/api/proxy', '');
  }
  
  const targetUrl = `${TARGET_API}${actualPath}`;
  
  try {
    // Check if request should be blocked FIRST (before any processing)
    // Use actualPath for rule matching since rules are configured with API paths, not proxy URLs
    const shouldBlock = await proxyRuleService.shouldBlockRequest(actualPath, method);
    
    if (shouldBlock) {
      const responseTime = Date.now() - startTime;
      
      logger.warn('Request blocked by proxy rule', {
        url: originalUrl,
        actualPath,
        method,
        user: req.user?.username,
        responseTime
      });
      
      // Return blocked response immediately
      res.status(403).json({ 
        message: 'Request blocked by proxy rule',
        timestamp: new Date().toISOString(),
        blocked: true
      });
      return;
    }

    // Check if request should be logged
    const shouldLog = await proxyRuleService.shouldLogRequest(actualPath, method);
    
    // Find matching rule for logging (only if logging is enabled)
    const matchingRule = shouldLog ? await proxyRuleService.findMatchingRule(actualPath, method) : null;

    // Prepare headers for forwarding
    const headers = { ...req.headers };
    delete headers.host; // Remove host header to avoid conflicts
    delete headers['content-length']; // Let axios set this automatically

    // Forward the request
    const response = await axios({
      method,
      url: targetUrl,
      data: req.body,
      headers,
      timeout: 30000, // 30 second timeout
      validateStatus: () => true // Don't throw on HTTP error status
    });

    const responseTime = Date.now() - startTime;

    // Log the request ONLY if logging is enabled
    if (shouldLog) {
      try {
        await Log.create({
          method,
          url: originalUrl,
          timestamp: new Date(),
          status: response.status,
          user: req.user?.username,
          requestedBy: req.user?.id || req.user?._id || req.user?.username,
          responseTime,
          proxyRuleId: matchingRule?._id,
          targetUrl,
          isProxied: true,
          meta: {
            targetApi: TARGET_API,
            ruleName: matchingRule?.name,
            userAgent: req.headers['user-agent'],
            ip: req.ip
          }
        });
      } catch (logError) {
        logger.error('Error logging proxy request:', logError);
      }
    }

    // Forward the response
    res.status(response.status);
    
    // Forward response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null && typeof value === 'string') {
        res.setHeader(key, value);
      }
    });

    // Send response data
    if (response.data !== undefined) {
      res.json(response.data);
    } else {
      res.end();
    }

    logger.info('Proxy request completed', {
      url: originalUrl,
      method,
      status: response.status,
      responseTime,
      user: req.user?.username,
      logged: shouldLog
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Proxy request failed', {
      url: originalUrl,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      user: req.user?.username
    });

    // Only log failed requests if logging is enabled
    const shouldLog = await proxyRuleService.shouldLogRequest(actualPath, method);
    if (shouldLog) {
      try {
        await Log.create({
          method,
          url: originalUrl,
          timestamp: new Date(),
          status: 500,
          user: req.user?.username,
          requestedBy: req.user?.id || req.user?._id || req.user?.username,
          responseTime,
          isProxied: true,
          targetUrl,
          meta: {
            error: error instanceof Error ? error.message : 'Unknown error',
            targetApi: TARGET_API
          }
        });
      } catch (logError) {
        logger.error('Error logging failed proxy request:', logError);
      }
    }

    res.status(500).json({ 
      message: 'Proxy request failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

export const simulateExternalUserRequest = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const originalUrl = req.originalUrl;
  const method = 'GET';
  const actualPath = '/users'; // This is the actual API path being requested
  const targetUrl = `${TARGET_API}${actualPath}`;
  
  try {
    // Check if request should be blocked FIRST
    const shouldBlock = await proxyRuleService.shouldBlockRequest(actualPath, method);
    
    if (shouldBlock) {
      const responseTime = Date.now() - startTime;
      
      logger.warn('Simulated request blocked by proxy rule', {
        url: originalUrl,
        actualPath,
        method,
        user: req.user?.username,
        responseTime
      });
      
      res.status(403).json({ 
        message: 'Request blocked by proxy rule',
        timestamp: new Date().toISOString(),
        blocked: true
      });
      return;
    }

    // Check if request should be logged
    const shouldLog = await proxyRuleService.shouldLogRequest(actualPath, method);
    
    const response = await axios.get(targetUrl, { timeout: 30000 });
    const responseTime = Date.now() - startTime;
    
    // Log the request ONLY if logging is enabled
    if (shouldLog) {
      try {
        await Log.create({
          method,
          url: originalUrl,
          timestamp: new Date(),
          status: response.status,
          user: req.user?.username,
          requestedBy: req.user?.id || req.user?._id || req.user?.username,
          responseTime,
          targetUrl,
          isProxied: true,
          meta: {
            targetApi: TARGET_API,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            simulation: true
          }
        });
      } catch (logError) {
        logger.error('Error logging simulated proxy request:', logError);
      }
    }
    
    res.status(response.status).json(response.data);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Simulated proxy request failed', {
      url: originalUrl,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      user: req.user?.username
    });
    
    // Only log failed requests if logging is enabled
    const shouldLog = await proxyRuleService.shouldLogRequest(originalUrl, method);
    if (shouldLog) {
      try {
        await Log.create({
          method,
          url: originalUrl,
          timestamp: new Date(),
          status: 500,
          user: req.user?.username,
          requestedBy: req.user?.id || req.user?._id || req.user?.username,
          responseTime,
          isProxied: true,
          targetUrl,
          meta: {
            error: error instanceof Error ? error.message : 'Unknown error',
            targetApi: TARGET_API,
            simulation: true
          }
        });
      } catch (logError) {
        logger.error('Error logging failed simulated proxy request:', logError);
      }
    }
    
    res.status(500).json({ 
      message: 'Simulated proxy request failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getProxyStatus = async (_req: Request, res: Response) => {
  try {
    const rules = await proxyRuleService.getAllRules();
    const activeRules = rules.filter(rule => rule.enabled);
    
    res.json({
      status: 'active',
      targetApi: TARGET_API,
      activeRules: activeRules.length,
      totalRules: rules.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting proxy status:', error);
    res.status(500).json({ 
      message: 'Error getting proxy status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 