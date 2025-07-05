import { Router } from 'express';
import { register, login } from '@/controllers/authController';
import { validateRequest } from '@/middleware/validation';
import { loginSchema, createUserSchema } from '@/utils/validation';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

router.post('/register', validateRequest(createUserSchema), asyncHandler(register));
router.post('/login', validateRequest(loginSchema), asyncHandler(login));

export default router; 