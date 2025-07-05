import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for login form
export const useLogin = () => {
  const { login, loginLoading, error, clearError } = useAuth();
  
  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  return {
    login: handleLogin,
    loading: loginLoading,
    error,
    clearError,
  };
}; 