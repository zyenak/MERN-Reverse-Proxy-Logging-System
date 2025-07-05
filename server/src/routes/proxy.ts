import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { handleProxy, getProxyStatus, simulateExternalUserRequest } from '@/controllers/proxyController';

const router = Router();

// Get proxy status
router.get('/status', getProxyStatus);

// Handle all proxy requests - use a simple parameter
router.get('/:path', authenticate, handleProxy);
router.post('/:path', authenticate, handleProxy);
router.put('/:path', authenticate, handleProxy);
router.delete('/:path', authenticate, handleProxy);
router.patch('/:path', authenticate, handleProxy);
router.post('/users/simulate', authenticate, simulateExternalUserRequest);

export default router; 