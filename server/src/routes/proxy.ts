import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticate } from '../middleware/auth';
import { logRequest } from '../middleware/logRequest';

const router = Router();

router.use(
  '/',
  authenticate,
  logRequest,
  createProxyMiddleware({
    target: 'https://jsonplaceholder.typicode.com',
    changeOrigin: true,
    pathRewrite: { '^/': '/users' },
  })
);

export default router; 