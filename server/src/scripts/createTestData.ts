import mongoose from 'mongoose';
import Log from '../models/Log';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const createTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proxy-logging-system');
    console.log('Connected to MongoDB');

    // Create test users
    const testUsers = [];
    for (let i = 1; i <= 25; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        role: i === 1 ? 'admin' : 'user',
        isActive: true,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Different creation dates
      });
      testUsers.push(user);
    }
    await User.insertMany(testUsers);
    console.log('Created 25 test users');

    // Create test logs
    const testLogs = [];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statuses = [200, 201, 400, 401, 404, 500];
    const urls = [
      '/api/users',
      '/api/posts',
      '/api/comments',
      '/api/profiles',
      '/api/settings',
      '/api/notifications'
    ];

    for (let i = 1; i <= 50; i++) {
      const log = new Log({
        method: methods[Math.floor(Math.random() * methods.length)],
        url: urls[Math.floor(Math.random() * urls.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        responseTime: Math.floor(Math.random() * 1000) + 50,
        user: `testuser${Math.floor(Math.random() * 25) + 1}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Different timestamps
        isProxied: true,
        targetUrl: `https://jsonplaceholder.typicode.com${urls[Math.floor(Math.random() * urls.length)]}`,
        meta: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
          requestId: `req-${i}-${Date.now()}`
        }
      });
      testLogs.push(log);
    }
    await Log.insertMany(testLogs);
    console.log('Created 50 test logs');

    console.log('Test data created successfully!');
    console.log('You should now see pagination controls on the Logs and Users pages.');
    console.log('- Logs page: 50 logs with 10 per page = 5 pages');
    console.log('- Users page: 25 users with 10 per page = 3 pages');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestData(); 