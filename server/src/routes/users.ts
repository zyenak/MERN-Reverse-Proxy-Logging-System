import { Router, RequestHandler } from 'express';
import { getUsers, deleteUser, getExternalUsers } from '@/controllers/adminUserController';
import { authenticate } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

router.get('/', authenticate as RequestHandler, asyncHandler(getUsers));
router.delete('/:id', authenticate as RequestHandler, asyncHandler(deleteUser));
router.get('/external', authenticate as RequestHandler, asyncHandler(getExternalUsers));

export default router; 