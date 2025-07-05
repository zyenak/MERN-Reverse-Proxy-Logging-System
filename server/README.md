# MERN Reverse Proxy Logging System - Server

A comprehensive reverse proxy system with advanced logging, rule-based request filtering, and security features.

## 🚀 Features

### Core Functionality
- **Reverse Proxy**: Forward requests to external APIs (JSONPlaceholder by default)
- **Rule-Based Filtering**: Configure path and method-specific rules
- **Comprehensive Logging**: Track all requests with detailed metadata
- **Authentication & Authorization**: JWT-based auth with role-based access control

### Advanced Features
- **Multiple Proxy Rules**: Support for multiple rules with priority-based matching
- **Enhanced Security**: Rate limiting, input sanitization, security headers
- **Real-time Monitoring**: Request statistics and performance metrics
- **Flexible Logging**: Configurable logging per rule with rich metadata

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5+
- TypeScript 5+

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/reverse-proxy-logger
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Migration**
   ```bash
   npm run migrate
   ```

5. **Create Admin User**
   ```bash
   npm run create-admin
   ```

## 🚀 Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Proxy
- `GET /api/proxy/status` - Get proxy status
- `* /api/proxy/*` - Forward requests to target API

### Proxy Rules (Admin Only)
- `GET /api/proxy-rule` - Get all proxy rules
- `GET /api/proxy-rule/:id` - Get specific rule
- `POST /api/proxy-rule` - Create new rule
- `PUT /api/proxy-rule/:id` - Update rule
- `DELETE /api/proxy-rule/:id` - Delete rule
- `POST /api/proxy-rule/reset` - Reset to defaults

### Logs
- `GET /api/logs` - Get logs with filtering
- `GET /api/logs/stats` - Get log statistics
- `GET /api/logs/:id` - Get specific log
- `DELETE /api/logs/:id` - Delete log (Admin)
- `DELETE /api/logs` - Delete multiple logs (Admin)

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Configuration

### Proxy Rule Structure
```typescript
interface ProxyRule {
  name: string;           // Rule name
  path: string;           // URL path to match
  methods: string[];      // HTTP methods to match
  loggingEnabled: boolean; // Enable/disable logging
  isBlocked: boolean;     // Block or allow requests
  forwardTarget?: string; // Custom forward target
  priority: number;       // Rule priority (higher = first)
  enabled: boolean;       // Enable/disable rule
}
```

### Default Rules
The system creates these default rules:
1. **Default API Access** - Allows all API requests
2. **Block Sensitive Endpoints** - Blocks admin endpoints
3. **Allow Public Endpoints** - Allows public read access

## 🔒 Security Features

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes
- **Proxy requests**: 100 requests per minute
- **API endpoints**: 50 requests per minute

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Input Validation
- Request size limits (10MB)
- Input sanitization
- Schema validation with Zod

## 📊 Logging

### Log Structure
```typescript
interface Log {
  method: string;
  url: string;
  timestamp: Date;
  status: number;
  user?: string;
  responseTime: number;
  proxyRuleId?: ObjectId;
  targetUrl?: string;
  isProxied: boolean;
  meta?: Record<string, any>;
}
```

### Log Filtering
- By method, URL, user, status
- By date range (from/to)
- By proxy rule
- By proxied status
- Full-text search

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/reverse-proxy-logger |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | development |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🔄 Migration

When updating from older versions, run the migration script:
```bash
npm run migrate
```

This will:
- Convert old proxy rule format to new format
- Create default rules if none exist
- Set up database indexes for performance

## 📈 Performance

### Database Indexes
- Proxy rules: `{ path: 1, priority: -1 }`, `{ enabled: 1 }`
- Logs: `{ timestamp: -1 }`, `{ method: 1, timestamp: -1 }`, `{ status: 1, timestamp: -1 }`

### Caching
- Proxy rules are cached for 5 minutes
- Cache is invalidated on rule updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 