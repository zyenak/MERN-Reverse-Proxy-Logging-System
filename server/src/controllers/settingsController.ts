import { Request, Response } from 'express';

// Default system settings
const defaultSettings = {
  proxy: {
    targetApi: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    maxRetries: 3,
    enableCaching: false,
    cacheTimeout: 300
  },
  logging: {
    enabled: true,
    level: 'info',
    retentionDays: 30,
    enableRequestLogging: true,
    enableResponseLogging: false
  },
  security: {
    enableRateLimiting: true,
    maxRequestsPerMinute: 100,
    enableCORS: true,
    allowedOrigins: ['http://localhost:5173'],
    enableJWTValidation: true,
    sessionTimeout: 3600
  },
  performance: {
    enableCompression: true,
    enableGzip: true,
    maxPayloadSize: 10485760,
    enableKeepAlive: true,
    keepAliveTimeout: 65000
  }
};

// In-memory settings storage (in production, this would be in a database)
let currentSettings = { ...defaultSettings };

export const getSettings = async (req: Request, res: Response) => {
  try {
    res.json(currentSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Validate and merge settings
    currentSettings = {
      ...currentSettings,
      ...updates
    };
    
    res.json({ 
      message: 'Settings updated successfully',
      settings: currentSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
};

export const resetSettings = async (req: Request, res: Response) => {
  try {
    currentSettings = { ...defaultSettings };
    
    res.json({ 
      message: 'Settings reset to defaults',
      settings: currentSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings', error });
  }
}; 