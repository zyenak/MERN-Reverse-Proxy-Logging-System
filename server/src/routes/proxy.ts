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
    pathRewrite: (path, req) => path.replace(/^\/api\/proxy/, '')

  })
);

export default router; 