import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const createMockUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    // Admin user
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    if (!adminPassword) {
      logger.error('ADMIN_PASSWORD environment variable is required');
      logger.error('Please set ADMIN_PASSWORD in your .env file');
      process.exit(1);
    }
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
        email: adminEmail,
        isActive: true,
        createdAt: new Date(),
        lastLogin: undefined,
      });
      await adminUser.save();
      logger.info('Admin user created successfully');
      logger.info(`Username: ${adminUsername}`);
      logger.info('Password: [HIDDEN - check your .env file]');
    } else {
      logger.info(`Admin user '${adminUsername}' already exists`);
    }
    // Mock regular user
    const userUsername = 'mockuser';
    const userPassword = 'mockpassword123';
    const userEmail = 'mockuser@example.com';
    const existingUser = await User.findOne({ username: userUsername });
    if (!existingUser) {
      const hashedUserPassword = await bcrypt.hash(userPassword, 10);
      const mockUser = new User({
        username: userUsername,
        password: hashedUserPassword,
        role: 'user',
        email: userEmail,
        isActive: true,
        createdAt: new Date(),
        lastLogin: undefined,
      });
      await mockUser.save();
      logger.info('Mock user created successfully');
      logger.info(`Username: ${userUsername}`);
      logger.info(`Password: ${userPassword}`);
    } else {
      logger.info(`Mock user '${userUsername}' already exists`);
    }
    logger.warn('\n SECURITY WARNING:');
    logger.warn('- Change the default passwords after first login');
    logger.warn('- Consider deleting this script after setup');
    logger.warn('- Use strong, unique passwords in production');
    process.exit(0);
  } catch (error) {
    logger.error('Error creating mock users:', error);
    process.exit(1);
  }
};

createMockUsers(); 