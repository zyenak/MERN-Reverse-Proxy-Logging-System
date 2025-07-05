import { Router, RequestHandler } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { 
  getLogs, 
  getLogById, 
  deleteLog, 
  deleteLogs, 
  getLogStats,
  exportLogs
} from '@/controllers/logController';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

// Get all logs with filtering
router.get('/', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(getLogs));

// Get log statistics - must come before /:id route
router.get('/stats', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(getLogStats));

// Export logs
router.get('/export', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(exportLogs));

// Get specific log by ID
router.get('/:id', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(getLogById));

// Delete specific log (admin only)
router.delete('/:id', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(deleteLog)
);

// Delete multiple logs (admin only)
router.delete('/', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(deleteLogs)
);

export default router; 