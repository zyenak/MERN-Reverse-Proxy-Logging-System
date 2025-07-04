import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './services/db';
import authRouter from './routes/auth';
import proxyRouter from './routes/proxy';
import logsRouter from './routes/logs';
import usersRouter from './routes/users';
import proxyRuleRouter from './routes/proxyRule';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/logs', logsRouter);
app.use('/api/users', usersRouter);
app.use('/api/proxy-rule', proxyRuleRouter);

const PORT = process.env.PORT || 5000;

app.get('/', (_, res) => {
  res.send('Reverse Proxy Logger API');
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
