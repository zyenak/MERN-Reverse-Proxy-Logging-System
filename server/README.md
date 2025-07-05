# Reverse Proxy Logging System

A full-stack TypeScript application using the MERN stack (MongoDB, Express.js, React, Node.js) and shadcn/ui to simulate a reverse proxy logging system.

## Features

- **Reverse Proxy**: Forwards requests to external APIs with logging
- **Request Logging**: Intercepts and logs all proxied requests to MongoDB
- **Admin Dashboard**: Secure dashboard for viewing logs and managing proxy rules
- **Authentication**: JWT-based authentication for admin access
- **Proxy Rules**: Enable/disable logging and manage endpoint whitelists
- **User Management**: Admin user management system

## Tech Stack

### Backend
- **Node.js** with **Express.js** and **TypeScript**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **http-proxy-middleware** for reverse proxy functionality

### Frontend
- **React** with **TypeScript**
- **shadcn/ui** for modern UI components
- **Vite** for build tooling

## Prerequisites

- Node.js (v22.17.0 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/reverse-proxy-logger

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Admin User (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

### Environment Variables Explained

- **PORT**: Server port (default: 5000)
- **MONGO_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token signing (use a strong, random string)
- **ADMIN_USERNAME**: Username for the admin user (default: admin)
- **ADMIN_PASSWORD**: Password for the admin user (**REQUIRED**)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MERN-Reverse-Proxy-Logging-System
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Environment Configuration
```bash
# Copy and edit the environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup
```bash
# Start MongoDB (if using local instance)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env with your Atlas connection string
```

### 5. Create Admin User
```bash
npm run create-admin
```

### 6. Start the Backend Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 7. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Proxy
- `GET /api/proxy/*` - Proxy requests to external API (requires auth)

### Logs
- `GET /api/logs` - Get logs with filtering/search
- `DELETE /api/logs/:id` - Delete specific log

### Users
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Proxy Rules
- `GET /api/proxy-rule` - Get current proxy rules
- `PUT /api/proxy-rule` - Update proxy rules
- `POST /api/proxy-rule/reset` - Reset proxy rules to defaults

### External Users
- `GET /api/users/external` - Fetch users from proxied API

## Security Considerations

### ⚠️ CRITICAL SECURITY WARNINGS

1. **Admin Credentials**
   - **ALWAYS** change the default admin password after first login
   - Use strong, unique passwords in production
   - Consider deleting the `createAdmin.ts` script after initial setup

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, random values for `JWT_SECRET`
   - Rotate secrets regularly in production

3. **Database Security**
   - Use MongoDB authentication in production
   - Restrict database access to application servers only
   - Enable MongoDB audit logging

4. **Network Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Consider using a reverse proxy (nginx) in front of the application

### Production Deployment Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS
- [ ] Implement rate limiting
- [ ] Set up proper logging
- [ ] Configure CORS properly
- [ ] Use environment-specific configurations
- [ ] Set up monitoring and alerting

## Usage

### 1. Login to Dashboard
- Navigate to the frontend application
- Login with your admin credentials

### 2. View External Users
- The dashboard displays users from the proxied API
- Data is fetched from `https://jsonplaceholder.typicode.com/users`

### 3. Monitor Proxy Logs
- View all proxied requests in the logs section
- Filter and search logs by various criteria
- Monitor response times and status codes

### 4. Manage Proxy Rules
- Enable/disable request logging
- Configure endpoint whitelists
- Reset proxy rules to defaults

## Development

### Project Structure
```
server/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Database and external services
│   ├── utils/           # Utility functions
│   └── scripts/         # Setup scripts
├── .env                 # Environment variables
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run create-admin` - Create admin user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository. 