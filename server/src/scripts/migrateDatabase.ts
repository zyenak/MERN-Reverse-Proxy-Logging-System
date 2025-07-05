import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProxyRule from '@/models/ProxyRule';
import logger from '@/utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reverse-proxy-logger';

async function migrateDatabase() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Check if migration is needed
    const existingRules = await ProxyRule.find({});
    
    if (existingRules.length === 0) {
      logger.info('No existing rules found, creating default rules...');
      
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
        },
        {
          name: 'Allow Public Endpoints',
          path: '/api/public',
          methods: ['GET'],
          loggingEnabled: true,
          isBlocked: false,
          priority: 5,
          enabled: true
        }
      ]);
      
      logger.info('Default proxy rules created successfully');
    } else {
      logger.info('Existing rules found, checking for migration...');
      
      // Check if any rules need migration (old format)
      const oldFormatRules = existingRules.filter(rule => 
        !rule.name || !rule.path || !rule.methods
      );
      
      if (oldFormatRules.length > 0) {
        logger.info(`Found ${oldFormatRules.length} rules in old format, migrating...`);
        
        for (const oldRule of oldFormatRules) {
          // Convert old format to new format
          const newRule = {
            name: 'Migrated Rule',
            path: '/api', // Default path
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Default methods
            loggingEnabled: true,
            isBlocked: !oldRule.enabled,
            priority: 0,
            enabled: oldRule.enabled || true
          };
          
          // Update the rule
          await ProxyRule.findByIdAndUpdate(oldRule._id, newRule);
          logger.info(`Migrated rule ${oldRule._id}`);
        }
        
        logger.info('Migration completed successfully');
      } else {
        logger.info('All rules are already in the new format');
      }
    }

    // Create indexes for better performance
    await ProxyRule.collection.createIndex({ path: 1, priority: -1 });
    await ProxyRule.collection.createIndex({ enabled: 1 });
    
    logger.info('Database indexes created');

    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

export default migrateDatabase; 