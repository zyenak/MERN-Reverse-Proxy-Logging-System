import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';

describe('validateRequest middleware', () => {
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

  it('should call next() when validation passes', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = { name: 'John', age: 30 };

    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 error when validation fails', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = { name: 'John', age: 'invalid' };

    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: 'age',
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('should handle multiple validation errors', async () => {
    const schema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
    });

    mockRequest.body = { name: 'ab', email: 'invalid-email' };

    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'email' }),
      ]),
    });
  });

  it('should handle non-Zod errors', async () => {
    const schema = z.object({
      name: z.string(),
    });

    // Mock a non-Zod error
    jest.spyOn(schema, 'parseAsync').mockRejectedValue(new Error('Unexpected error'));

    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal server error during validation',
    });
  });
}); 