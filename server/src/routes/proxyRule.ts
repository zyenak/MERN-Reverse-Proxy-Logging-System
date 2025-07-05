import { Router, RequestHandler } from 'express';
import { getProxyRule, updateProxyRule, resetProxyRule } from '../controllers/proxyRuleController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateProxyRuleSchema } from '../utils/validation';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate as RequestHandler, asyncHandler(getProxyRule));
router.put('/', authenticate as RequestHandler, validateRequest(updateProxyRuleSchema), asyncHandler(updateProxyRule));
router.post('/reset', authenticate as RequestHandler, asyncHandler(resetProxyRule));

export default router; 