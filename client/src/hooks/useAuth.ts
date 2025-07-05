import { useApi } from '@/hooks';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useLogin = () => {
  return useApi<AuthResponse>({
    url: `${API_BASE_URL}/auth/login`,
    method: 'POST',
    showToast: true,
  });
};

export const useRegister = () => {
  return useApi<AuthResponse>({
    url: `${API_BASE_URL}/auth/register`,
    method: 'POST',
    showToast: true,
  });
}; 