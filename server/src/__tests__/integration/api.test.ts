import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from '../../routes/auth';
import usersRouter from '../../routes/users';
import proxyRuleRouter from '../../routes/proxyRule';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/proxy-rule', proxyRuleRouter);

// Mock authentication middleware for protected routes
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
}));

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          username: 'testuser',
          password: 'password123',
          role: 'user',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.message).toBe('User registered successfully.');
      });

      it('should return error for invalid data', async () => {
        const invalidData = {
          username: 'ab', // Too short
          password: '123', // Too short
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toBeDefined();
      });

      it('should return error for duplicate username', async () => {
        const userData = {
          username: 'testuser',
          password: 'password123',
        };

        // Register first user
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        // Try to register same username
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body.message).toBe('Username already exists.');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        // Create a test user
        await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            password: 'password123',
          });
      });

      it('should login with valid credentials', async () => {
        const loginData = {
          username: 'testuser',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.token).toBeDefined();
        expect(response.body.user.username).toBe('testuser');
      });

      it('should return error for invalid credentials', async () => {
        const loginData = {
          username: 'testuser',
          password: 'wrongpassword',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body.message).toBe('Invalid credentials.');
      });
    });
  });

  describe('Proxy Rule Routes', () => {
    describe('GET /api/proxy-rule', () => {
      it('should return default proxy rule', async () => {
        const response = await request(app)
          .get('/api/proxy-rule')
          .expect(200);

        expect(response.body.enabled).toBe(true);
        expect(response.body.whitelist).toEqual([]);
      });
    });

    describe('PUT /api/proxy-rule', () => {
      it('should update proxy rule', async () => {
        const updates = {
          enabled: false,
          whitelist: ['/api', '/admin'],
        };

        const response = await request(app)
          .put('/api/proxy-rule')
          .send(updates)
          .expect(200);

        expect(response.body.enabled).toBe(false);
        expect(response.body.whitelist).toEqual(['/api', '/admin']);
      });

      it('should return error for invalid data', async () => {
        const invalidData = {
          enabled: 'not-a-boolean',
          whitelist: 'not-an-array',
        };

        const response = await request(app)
          .put('/api/proxy-rule')
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toBe('Validation failed');
      });
    });

    describe('POST /api/proxy-rule/reset', () => {
      it('should reset proxy rule to defaults', async () => {
        // First update the rule
        await request(app)
          .put('/api/proxy-rule')
          .send({ enabled: false, whitelist: ['/test'] });

        // Then reset it
        const response = await request(app)
          .post('/api/proxy-rule/reset')
          .expect(200);

        expect(response.body.enabled).toBe(true);
        expect(response.body.whitelist).toEqual([]);
      });
    });
  });
}); 