import { z } from 'zod';

// Proxy Rule validation schemas
export const updateProxyRuleSchema = z.object({
  enabled: z.boolean().optional(),
  whitelist: z.array(z.string()).optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'user']).default('user'),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Type exports for use in controllers
export type UpdateProxyRuleInput = z.infer<typeof updateProxyRuleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>; 