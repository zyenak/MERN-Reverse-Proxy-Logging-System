import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '@/services/db';
import authRouter from '@/routes/auth';
import proxyRouter from '@/routes/proxy';
import logsRouter from '@/routes/logs';
import usersRouter from '@/routes/users';
import proxyRuleRouter from '@/routes/proxyRule';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { 
  authRateLimit, 
  proxyRateLimit, 
  apiRateLimit, 
  sanitizeInput, 
  limitRequestSize, 
  securityHeaders 
} from '@/middleware/security';
import logger from '@/utils/logger';

dotenv.config();

// Debug: Check environment loading
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('PORT:', process.env.PORT);
console.log('=== END ENVIRONMENT DEBUG ===');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(limitRequestSize);
app.use(sanitizeInput);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/auth', authRateLimit);
app.use('/api/proxy', proxyRateLimit);
app.use('/api', apiRateLimit);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/logs', logsRouter);
app.use('/api/users', usersRouter);
app.use('/api/proxy-rule', proxyRuleRouter);

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (_, res) => {
  res.json({ 
    message: 'Reverse Proxy Logger API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      proxy: '/api/proxy',
      logs: '/api/logs',
      users: '/api/users',
      proxyRules: '/api/proxy-rule'
    }
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
