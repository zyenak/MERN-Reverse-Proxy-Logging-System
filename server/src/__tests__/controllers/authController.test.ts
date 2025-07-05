import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login } from '../../controllers/authController';
import User from '../../models/User';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/logger');

const MockedUser = User as jest.Mocked<typeof User>;
const MockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const MockedJwt = jwt as jest.Mocked<typeof jwt>;



describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        role: 'user' as const,
      };

      mockRequest.body = userData;
      MockedUser.findOne.mockResolvedValue(null);
      MockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      
      const mockUser = {
        save: jest.fn().mockResolvedValue(true),
      };
      (MockedUser as any).mockImplementation(() => mockUser as any);

      await register(mockRequest as Request, mockResponse as Response);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(MockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(MockedUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully.',
      });
    });

    it('should return error if username already exists', async () => {
      const userData = {
        username: 'existinguser',
        password: 'password123',
      };

      mockRequest.body = userData;
      MockedUser.findOne.mockResolvedValue({ username: 'existinguser' } as any);

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Username already exists.',
      });
    });

    it('should handle server errors', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };
      MockedUser.findOne.mockRejectedValue(new Error('Database error'));

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: expect.any(Error),
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
      };

      mockRequest.body = loginData;
      MockedUser.findOne.mockResolvedValue(mockUser as any);
      MockedBcrypt.compare.mockResolvedValue(true as never);
      MockedJwt.sign.mockReturnValue('jwt-token' as any);

      await login(mockRequest as Request, mockResponse as Response);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(MockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(MockedJwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'jwt-token',
        user: { id: 'user-id', username: 'testuser', role: 'user' },
      });
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockRequest.body = loginData;
      MockedUser.findOne.mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials.',
      });
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
      };

      mockRequest.body = loginData;
      MockedUser.findOne.mockResolvedValue(mockUser as any);
      MockedBcrypt.compare.mockResolvedValue(false as never);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials.',
      });
    });

    it('should handle server errors', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };
      MockedUser.findOne.mockRejectedValue(new Error('Database error'));

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: expect.any(Error),
      });
    });
  });
}); 