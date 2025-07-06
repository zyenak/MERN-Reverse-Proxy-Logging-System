import { Request, Response, NextFunction } from 'express';
import { validateLogin, validateCreateUser, validateCreateProxyRule } from '@/middleware/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      path: '/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('validateLogin', () => {
    it('should call next() when validation passes', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'password123' 
      };

      await validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 error when email is invalid', async () => {
      mockRequest.body = { 
        email: 'invalid-email', 
        password: 'password123' 
      };

      await validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input data.',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      });
    });

    it('should return 400 error when password is missing', async () => {
      mockRequest.body = { 
        email: 'test@example.com' 
      };

      await validateLogin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input data.',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'password' })
        ])
      });
    });
  });

  describe('validateCreateUser', () => {
    it('should call next() when validation passes', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'password123',
        role: 'user'
      };

      await validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 error when role is invalid', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'password123',
        role: 'invalid-role'
      };

      await validateCreateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input data.',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'role' })
        ])
      });
    });
  });

  describe('validateCreateProxyRule', () => {
    it('should call next() when validation passes', async () => {
      mockRequest.body = { 
        name: 'Test Rule',
        pattern: '/api/test',
        isBlocking: false
      };

      await validateCreateProxyRule(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() when validation passes with forwardTarget', async () => {
      mockRequest.body = { 
        name: 'Test Rule',
        pattern: '/api/test',
        forwardTarget: 'https://api.example.com',
        isBlocking: false
      };

      await validateCreateProxyRule(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 error when name is missing', async () => {
      mockRequest.body = { 
        pattern: '/api/test',
        isBlocking: false
      };

      await validateCreateProxyRule(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input data.',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' })
        ])
      });
    });
  });
}); 