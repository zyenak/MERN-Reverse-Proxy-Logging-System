import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dotenv from 'dotenv';
import logger from '@/utils/logger';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      logger.error('ADMIN_PASSWORD environment variable is required');
      logger.error('Please set ADMIN_PASSWORD in your .env file');
      process.exit(1);
    }
    
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (existingAdmin) {
      logger.info(`Admin user '${adminUsername}' already exists`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      username: adminUsername,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    logger.info('Admin user created successfully');
    logger.info(`Username: ${adminUsername}`);
    logger.info('Password: [HIDDEN - check your .env file]');
    logger.warn('\n SECURITY WARNING:');
    logger.warn('- Change the default password after first login');
    logger.warn('- Consider deleting this script after setup');
    logger.warn('- Use strong, unique passwords in production');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser(); 