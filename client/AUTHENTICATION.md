# Authentication System

This document explains the authentication system implementation for the Ability MERN Reverse Proxy Logging System.

## Architecture

The authentication system is built using:

- **Context API**: `AuthContext` manages global authentication state
- **Custom Hooks**: `useAuth` and `useLogin` provide clean interfaces
- **Services**: `authService` handles API communication
- **Local Storage**: Persists authentication data across sessions

## Components

### 1. AuthContext (`src/context/AuthContext.tsx`)

Manages global authentication state including:
- User information
- Authentication status
- Loading states
- Error handling
- Login/logout functions

### 2. AuthService (`src/services/authService.ts`)

Handles API communication with the backend:
- Login requests
- Registration requests
- Token validation
- Local storage management
- Error handling

### 3. useAuth Hook (`src/hooks/useAuth.ts`)

Provides authentication functionality:
- `useAuth()`: Access to all auth context values
- `useLogin()`: Specialized hook for login forms

### 4. API Client (`src/services/apiClient.ts`)

Handles HTTP requests with:
- Automatic token injection
- Error handling
- Response interceptors

## Authentication Flow

1. **Login Process**:
   - User enters username/password
   - Form validates input
   - `useLogin` hook calls `authService.login()`
   - Backend validates credentials
   - JWT token and user data returned
   - Data stored in localStorage and context
   - User redirected to dashboard

2. **Token Validation**:
   - On app initialization, existing token is validated
   - Invalid tokens are cleared automatically
   - User redirected to login if needed

3. **Protected Routes**:
   - Routes check authentication status
   - Unauthenticated users redirected to login
   - Admin routes check user role

4. **Logout Process**:
   - Clears localStorage
   - Resets context state
   - Redirects to login page

## Usage Examples

### Login Form
```tsx
import { useLogin } from '@/hooks/useAuth';

const LoginForm = () => {
  const { login, loading, error } = useLogin();
  
  const handleSubmit = async (username: string, password: string) => {
    const result = await login(username, password);
    if (result.success) {
      // Redirect or show success message
    }
  };
};
```

### Protected Component
```tsx
import { useAuth } from '@/hooks/useAuth';

const ProtectedComponent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Welcome, {user?.username}!</div>;
};
```

## Environment Variables

Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
```

## Backend Integration

The frontend expects the backend to provide:

1. **Login Endpoint**: `POST /api/auth/login`
   - Request: `{ username, password }`
   - Response: `{ token, user }`

2. **Register Endpoint**: `POST /api/auth/register`
   - Request: `{ username, password, role? }`
   - Response: `{ token, user }`

3. **Token Validation**: `GET /api/auth/validate`
   - Headers: `Authorization: Bearer <token>`
   - Response: `200 OK` if valid

## Security Features

- JWT token-based authentication
- Automatic token injection in requests
- Token validation on app startup
- Automatic logout on token expiration
- Role-based access control
- Secure password handling (show/hide toggle)
- Error handling and user feedback

## Error Handling

The system provides comprehensive error handling:
- Network errors
- Authentication failures
- Token expiration
- Validation errors
- User-friendly error messages via toast notifications 