# MERN Reverse Proxy Logging System

A full-stack TypeScript-based web application using the MERN stack (MongoDB, Express.js, React, Node.js) and shadcn/ui, designed to simulate a reverse proxy logging system.

## 🚀 Features

### Core Functionality
- **Reverse Proxy Server**: Forwards requests to `https://jsonplaceholder.typicode.com/users`
- **Request Logging**: Intercepts and logs all proxied requests with detailed metadata
- **Real-time Dashboard**: Professional dashboard with statistics and system overview
- **User Authentication**: Secure login system with JWT tokens
- **Role-based Access**: Admin and user roles with different permissions

### Dashboard Features
- **System Statistics**: Total requests, success rate, average response time, active rules
- **Proxied User Data**: Display user data from the target API
- **Recent Activity**: Real-time log of proxy requests
- **Performance Metrics**: Response time trends and success rate visualization

### Log Management
- **Advanced Filtering**: Filter by method, status, date range, and search terms
- **Export Functionality**: Export logs as JSON files
- **Bulk Operations**: Delete individual logs or clear all logs
- **Detailed View**: View complete log details in modal dialogs

### Proxy Rules Management
- **CRUD Operations**: Create, read, update, and delete proxy rules
- **Rule Configuration**: Set paths, methods, logging, and blocking rules
- **Toggle Controls**: Enable/disable rules, logging, and blocking
- **Priority System**: Configure rule priorities for proper matching

### User Management
- **User Administration**: Create, edit, and delete system users
- **Role Management**: Assign admin or user roles
- **Status Control**: Activate/deactivate user accounts
- **Login Tracking**: Monitor user login activity

### System Settings
- **Proxy Configuration**: Target API, timeout, retries, caching
- **Logging Settings**: Log levels, retention policies, request/response logging
- **Security Settings**: Rate limiting, CORS, JWT validation, session timeout
- **Performance Settings**: Compression, payload limits, keep-alive

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js 5.1.0** framework
- **TypeScript 5.8.3** for type safety
- **MongoDB** with **Mongoose 8.16.1** ODM
- **JWT** for authentication
- **Axios 1.10.0** for HTTP requests
- **Jest 29.7.0** for testing

### Frontend
- **React 19.1.0** with **TypeScript 5.8.3**
- **Vite 7.0.0** for fast development and building
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS 4.1.11** for styling
- **React Router v7.6.3** for navigation
- **Lucide React 0.525.0** for icons
- **Sonner 2.0.6** for toast notifications

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Git** (for cloning the repository)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zyenak/MERN-Reverse-Proxy-Logging-System.git
cd MERN-Reverse-Proxy-Logging-System
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/reverse-proxy-logger
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:5173

# Admin user credentials (REQUIRED)
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
```

**Important**: The `ADMIN_PASSWORD` environment variable is **required** for creating the admin user.

### 3. Frontend Setup

```bash
cd client
npm install
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the necessary collections and indexes.

### 5. Create Admin User

Run the admin creation script:

```bash
cd server
npm run create-mock-users
```

This will create:
- **Admin user**: Username from `ADMIN_USERNAME` (defaults to 'admin'), Password from `ADMIN_PASSWORD`
- **Mock user**: Username: `mockuser`, Password: `mockpassword123`

**Security Warning**: 
- Change the default passwords after first login
- Use strong, unique passwords in production
- Consider deleting the script after setup

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**:
   ```bash
   cd client
   npm run dev
   ```
   The client will start on `http://localhost:5173`

3. **Access the Application**:
   - Open `http://localhost:5173` in your browser
   - Login with the admin credentials you set in the environment variables

### Production Mode

1. **Build the Frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Start the Production Server**:
   ```bash
   cd server
   npm start
   ```

## 📖 Usage Guide

### Authentication
1. Navigate to the login page
2. Enter your username and password (admin credentials from environment variables)
3. Upon successful login, you'll be redirected to the dashboard

### Dashboard
- **Overview Tab**: View system statistics and performance metrics
- **Users Tab**: See proxied user data from the target API
- **Activity Tab**: Monitor recent proxy requests

### Managing Logs
1. Navigate to the "Logs" page
2. Use filters to search and filter logs by various criteria
3. Click on a log entry to view detailed information
4. Export logs or delete them as needed

### Managing Proxy Rules
1. Navigate to the "Proxy Rules" page
2. Create new rules with specific paths and methods
3. Configure logging and blocking behavior
4. Toggle rules on/off as needed

### User Management
1. Navigate to the "Users" page (admin only)
2. Create new users with appropriate roles
3. Edit user information and permissions
4. Activate/deactivate user accounts

### System Settings
1. Navigate to the "Settings" page (admin only)
2. Configure proxy, logging, security, and performance settings
3. Save changes to apply new configurations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Proxy
- `GET /api/proxy/status` - Get proxy status
- `GET /api/proxy/:path` - Proxy requests to target API
- `POST /api/proxy/:path` - Proxy POST requests
- `PUT /api/proxy/:path` - Proxy PUT requests
- `DELETE /api/proxy/:path` - Proxy DELETE requests

### Logs
- `GET /api/logs` - Get logs with filtering
- `GET /api/logs/stats` - Get log statistics
- `GET /api/logs/export` - Export logs
- `DELETE /api/logs/:id` - Delete specific log
- `DELETE /api/logs` - Delete all logs

### Proxy Rules
- `GET /api/proxy-rule` - Get all proxy rules
- `POST /api/proxy-rule` - Create new proxy rule
- `PUT /api/proxy-rule/:id` - Update proxy rule
- `DELETE /api/proxy-rule/:id` - Delete proxy rule

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings
- `POST /api/settings/reset` - Reset to defaults


## 📁 Project Structure

```
MERN-Reverse-Proxy-Logging-System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── scripts/       # Setup and utility scripts
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and user permissions
- **Rate Limiting**: Prevent abuse with request rate limiting
- **Input Validation**: Sanitize and validate all inputs
- **CORS Protection**: Configured CORS for security
- **Security Headers**: Implemented security headers

## 🚀 Deployment

### Environment Variables
Make sure to set the following environment variables in production:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=your-production-client-url
ADMIN_PASSWORD=your-secure-production-admin-password
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
```

### Docker Deployment
The application can be containerized using Docker for easy deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🎯 Future Enhancements

- Real-time WebSocket notifications
- Advanced analytics and reporting
- Multi-tenant support
- API rate limiting dashboard
- Automated testing with CI/CD
- Docker containerization
- Kubernetes deployment support