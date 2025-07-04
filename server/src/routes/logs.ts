import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getLogs, deleteLog } from '../controllers/logController';

const router = Router();

router.get('/', authenticate as RequestHandler, getLogs);
router.delete('/:id', authenticate as RequestHandler, deleteLog);

export default router; 