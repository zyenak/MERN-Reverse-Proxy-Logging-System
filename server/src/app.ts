import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './services/db';
import authRouter from './routes/auth';
import proxyRouter from './routes/proxy';
import logsRouter from './routes/logs';
import usersRouter from './routes/users';
import proxyRuleRouter from './routes/proxyRule';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/logs', logsRouter);
app.use('/api/users', usersRouter);
app.use('/api/proxy-rule', proxyRuleRouter);

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.get('/', (_, res) => {
  res.send('Reverse Proxy Logger API');
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Server running on port ${PORT}`);
    } else {
      logger.info('Server started successfully');
    }
  });
};

startServer();
