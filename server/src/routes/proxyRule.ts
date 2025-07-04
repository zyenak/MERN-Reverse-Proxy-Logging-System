import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getProxyRule, updateProxyRule, resetProxyRule } from '../controllers/proxyRuleController';

const router = Router();

router.get('/', authenticate as RequestHandler, getProxyRule);
router.put('/', authenticate as RequestHandler, updateProxyRule);
router.post('/reset', authenticate as RequestHandler, resetProxyRule);

export default router; 