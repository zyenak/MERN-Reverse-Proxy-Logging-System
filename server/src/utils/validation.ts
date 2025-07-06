import { z } from 'zod';

// Proxy Rule validation schemas
export const createProxyRuleSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().min(1).max(500),
  methods: z.array(z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])).min(1),
  loggingEnabled: z.boolean().default(true),
  isBlocked: z.boolean().default(false),
  forwardTarget: z.string().url().optional().or(z.literal('')),
  priority: z.number().int().min(0).max(1000).default(0),
  enabled: z.boolean().default(true),
});

export const updateProxyRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  path: z.string().min(1).max(500).optional(),
  methods: z.array(z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])).min(1).optional(),
  loggingEnabled: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  forwardTarget: z.string().url().optional().or(z.literal('')),
  priority: z.number().int().min(0).max(1000).optional(),
  enabled: z.boolean().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'user']).default('user'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(8).max(100).optional(), // Increased minimum password length
  role: z.enum(['admin', 'user']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Type exports for use in controllers
export type CreateProxyRuleInput = z.infer<typeof createProxyRuleSchema>;
export type UpdateProxyRuleInput = z.infer<typeof updateProxyRuleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>; 