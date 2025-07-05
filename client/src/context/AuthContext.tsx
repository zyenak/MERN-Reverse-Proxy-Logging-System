import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import authService from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => void;
  loading: boolean;
  loginLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple initialization - just check if we have auth data
    setLoading(false);
  }, []); // Only run once on mount

  const login = async (username: string, password: string) => {
    try {
      setLoginLoading(true);
      setError(null);
      
      const response = await authService.login({ username, password });
      
      console.log('Login response:', response);
      
      // Store auth data
      authService.setAuthData(response.token, response.user);
      updateToken(response.token);
      updateUser(response.user);
      
      console.log('Token stored:', localStorage.getItem('token'));
      console.log('User stored:', localStorage.getItem('user'));
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const updateToken = useCallback((newToken: string | null) => {
    console.log('Updating token:', newToken ? 'Present' : 'Null');
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const register = async (username: string, password: string, role?: 'admin' | 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register({ username, password, role });
      
      // Store auth data
      authService.setAuthData(response.token, response.user);
      updateToken(response.token);
      updateUser(response.user);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    updateToken(null);
    updateUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    loading,
    loginLoading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 