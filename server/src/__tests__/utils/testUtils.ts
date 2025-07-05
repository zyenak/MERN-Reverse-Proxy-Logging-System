import mongoose from 'mongoose';
import { Request, Response } from 'express';

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
});

export const clearDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export const connectTestDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  }
};

export const disconnectTestDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
};

export const createTestUser = async (userData: any = {}) => {
  const User = mongoose.model('User');
  const defaultUser = {
    username: 'testuser',
    password: 'hashedPassword',
    role: 'user',
    ...userData,
  };
  return await User.create(defaultUser);
};

export const createTestProxyRule = async (ruleData: any = {}) => {
  const ProxyRule = mongoose.model('ProxyRule');
  const defaultRule = {
    enabled: true,
    whitelist: [],
    ...ruleData,
  };
  return await ProxyRule.create(defaultRule);
}; 