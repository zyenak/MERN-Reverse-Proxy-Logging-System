import { Router } from 'express';
import { register, login } from '@/controllers/authController';
import { validateLogin, validateRegister } from '@/middleware/validation';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

// router.post('/register', validateRegister, asyncHandler(register)); // Removed registration
router.post('/login', validateLogin, asyncHandler(login));

export default router; 