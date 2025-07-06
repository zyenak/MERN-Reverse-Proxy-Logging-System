import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { getErrorMessage } from '@/utils';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  retryAttempts?: number;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    onSuccess,
    onError,
    showToast = true,
    successMessage,
    errorMessage,
    retryAttempts,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let result: T;

        if (retryAttempts && retryAttempts > 1) {
          result = await apiClient.retryRequest(
            () => apiCall(...args),
            retryAttempts
          );
        } else {
          result = await apiCall(...args);
        }

        setState({ data: result, loading: false, error: null });

        if (onSuccess) {
          onSuccess(result);
        }

        if (showToast && successMessage) {
          toast.success(successMessage);
        }

        return result;
      } catch (error) {
        // Don't update state if request was cancelled
        if ((error as any)?.name === 'AbortError') {
          return null;
        }

        const apiError = error as Error;
        
        // Handle network errors more gracefully
        if (!(error as any)?.response) {
          console.warn('Network error detected - this might be due to server not being ready');
          // Don't show toast for network errors on initial load
          if (showToast && state.data !== null) {
            toast.error('Network error. Please check your connection.');
          }
        } else {
          if (onError) {
            onError(apiError);
          }

          if (showToast) {
            const message = errorMessage || apiError.message || ERROR_MESSAGES.DEFAULT;
            toast.error(message);
          }
        }

        setState(prev => ({ ...prev, loading: false, error: apiError }));
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [apiCall, onSuccess, onError, showToast, successMessage, errorMessage, retryAttempts]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Specialized hooks for common operations
export function useGet<T>(url: string, options?: UseApiOptions<T>) {
  return useApi(() => apiClient.get<T>(url), options);
}

export function usePost<T>(url: string, options?: UseApiOptions<T>) {
  return useApi((data?: any) => apiClient.post<T>(url, data), options);
}

export function usePut<T>(url: string, options?: UseApiOptions<T>) {
  return useApi((data?: any) => apiClient.put<T>(url, data), options);
}

export function useDelete<T>(url: string, options?: UseApiOptions<T>) {
  return useApi(() => apiClient.delete<T>(url), options);
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<{ data: T[]; total: number }>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (newParams?: any) => {
    const finalParams = { ...params, ...newParams };
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(finalParams);
      setData(result.data);
      setTotal(result.total);
      setParams(finalParams);
    } catch (err) {
      setError(err as Error);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const updateParams = useCallback((newParams: any) => {
    setParams((prev: any) => ({ ...prev, ...newParams }));
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setTotal(0);
    setParams(initialParams);
    setError(null);
  }, [initialParams]);

  return {
    data,
    total,
    loading,
    error,
    params,
    fetchData,
    updateParams,
    reset,
  };
} 