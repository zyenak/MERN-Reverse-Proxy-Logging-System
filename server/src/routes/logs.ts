import { Router, RequestHandler } from 'express';
import { authenticate } from '@/middleware/auth';
import { getLogs, deleteLog } from '@/controllers/logController';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

router.get('/', authenticate as RequestHandler, asyncHandler(getLogs));
router.delete('/:id', authenticate as RequestHandler, asyncHandler(deleteLog));

export default router; 