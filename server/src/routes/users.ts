import { Router, RequestHandler } from 'express';
import { getUsers, deleteUser, getExternalUsers, createUser, updateUserStatus } from '@/controllers/adminUserController';
import { authenticate, requireRole } from '@/middleware/auth';
import { validateCreateUser } from '@/middleware/validation';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

router.get('/', authenticate as RequestHandler, asyncHandler(getUsers));
router.get('/external', authenticate as RequestHandler, asyncHandler(getExternalUsers));
router.post('/', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, validateCreateUser, asyncHandler(createUser));
router.delete('/:id', authenticate as RequestHandler, asyncHandler(deleteUser));
router.patch('/:id/status', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(updateUserStatus));

export default router; 