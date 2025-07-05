import apiService from './api';
import type { Log, LogStats, LogFilters, PaginatedResponse } from '@/types';

export class LogService {
  async getLogs(filters?: LogFilters): Promise<PaginatedResponse<Log>> {
    return apiService.get<PaginatedResponse<Log>>('/logs', filters);
  }

  async getLogById(id: string): Promise<Log> {
    return apiService.get<Log>(`/logs/${id}`);
  }

  async getLogStats(): Promise<LogStats> {
    return apiService.get<LogStats>('/logs/stats');
  }

  async deleteLog(id: string): Promise<void> {
    return apiService.delete<void>(`/logs/${id}`);
  }

  async deleteLogs(ids: string[]): Promise<void> {
    return apiService.delete<void>('/logs', { ids });
  }
}

export const logService = new LogService();
export default logService; 