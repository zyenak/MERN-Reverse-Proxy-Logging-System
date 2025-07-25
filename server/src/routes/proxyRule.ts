import { Router, RequestHandler } from 'express';
import { 
  getAllProxyRules, 
  getProxyRuleById, 
  createProxyRule, 
  updateProxyRule, 
  deleteProxyRule, 
  resetProxyRules 
} from '@/controllers/proxyRuleController';
import { authenticate, requireRole } from '@/middleware/auth';
import { validateCreateProxyRule, validateUpdateProxyRule } from '@/middleware/validation';
import asyncHandler from '@/utils/asyncHandler';

const router = Router();

// Get all proxy rules
router.get('/', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(getAllProxyRules));

// Get specific proxy rule
router.get('/:id', authenticate as RequestHandler, requireRole(['admin']) as RequestHandler, asyncHandler(getProxyRuleById));

// Create new proxy rule (admin only)
router.post('/', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  validateCreateProxyRule, 
  asyncHandler(createProxyRule)
);

// Update proxy rule (admin only)
router.put('/:id', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  validateUpdateProxyRule, 
  asyncHandler(updateProxyRule)
);

// Delete proxy rule (admin only)
router.delete('/:id', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(deleteProxyRule)
);

// Reset to defaults (admin only)
router.post('/reset', 
  authenticate as RequestHandler, 
  requireRole(['admin']) as RequestHandler,
  asyncHandler(resetProxyRules)
);

export default router; 