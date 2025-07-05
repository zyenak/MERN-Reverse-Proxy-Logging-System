import { Router, RequestHandler } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { 
  getSettings, 
  updateSettings, 
  resetSettings 
} from '@/controllers/settingsController';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

// Get system settings
router.get('/', authenticate as RequestHandler, asyncHandler(getSettings));

// Update system settings (admin only)
router.put('/', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(updateSettings)
);

// Reset settings to defaults (admin only)
router.post('/reset', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(resetSettings)
);

export default router; 