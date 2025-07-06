import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '@/constants';
import { getErrorMessage } from '@/utils';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    const { response, config, code } = error;
    
    // Log error for debugging
    console.error('API Error:', {
      status: response?.status,
      url: config?.url,
      method: config?.method,
      data: response?.data,
      code: code,
      message: error.message,
    });

    // Handle network errors (no response)
    if (!response) {
      console.error('Network error - no response received');
      return;
    }

    // Handle authentication errors
    if (response?.status === 401) {
      const isAuthEndpoint = config?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) || 
                           config?.url?.includes(API_ENDPOINTS.AUTH.REGISTER);
      
      if (!isAuthEndpoint) {
        this.clearAuthData();
        window.location.href = '/';
      }
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Generic request methods
  async get<T>(url: string, params?: Record<string, any>, config?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(url, { params, ...config });
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  private createApiError(error: any): Error {
    const message = getErrorMessage(error);
    const apiError = new Error(message);
    apiError.name = 'ApiError';
    (apiError as any).status = error?.response?.status;
    (apiError as any).data = error?.response?.data;
    return apiError;
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if ((error as any)?.response?.status >= 400 && (error as any)?.response?.status < 500) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 