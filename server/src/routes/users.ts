import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getUsers, deleteUser } from '../controllers/userController';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate as RequestHandler, getUsers);
router.delete('/:id', authenticate as RequestHandler, asyncHandler(deleteUser));

export default router; 