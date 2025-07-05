import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '../utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        logger.warn('Validation error:', {
          path: req.path,
          errors: zodError.errors,
          body: req.body
        });
        
        res.status(400).json({
          message: 'Validation failed',
          errors: zodError.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      logger.error('Unexpected validation error:', error);
      res.status(500).json({
        message: 'Internal server error during validation'
      });
      return;
    }
  };
}; 