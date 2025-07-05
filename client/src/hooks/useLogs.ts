import { useApi } from '@/hooks';
import type { Log, LogStats, LogFilters, PaginatedResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useLogs = (filters?: LogFilters) => {
  const queryString = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/logs${queryString.toString() ? `?${queryString.toString()}` : ''}`;

  return useApi<PaginatedResponse<Log>>({
    url,
    method: 'GET',
    cacheKey: `logs-${queryString.toString()}`,
    cacheTime: 30 * 1000, // 30 seconds
  });
};

export const useLogStats = () => {
  return useApi<LogStats>({
    url: `${API_BASE_URL}/logs/stats`,
    method: 'GET',
    cacheKey: 'log-stats',
    cacheTime: 60 * 1000, // 1 minute
  });
};

export const useLogById = (id: string) => {
  return useApi<Log>({
    url: `${API_BASE_URL}/logs/${id}`,
    method: 'GET',
    cacheKey: `log-${id}`,
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeleteLog = () => {
  return useApi<null>({
    method: 'DELETE',
    showToast: true,
  });
};

export const useDeleteLogs = () => {
  return useApi<null>({
    method: 'DELETE',
    showToast: true,
  });
}; 