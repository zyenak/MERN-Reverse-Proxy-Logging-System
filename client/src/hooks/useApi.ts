import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseApiOptions<T> {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  cacheKey?: string;
  cacheTime?: number; // in milliseconds
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (options?: Partial<UseApiOptions<T>>) => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

const useApi = <T = any>(options: UseApiOptions<T> = {}): UseApiReturn<T> => {
  const {
    url,
    method = 'GET',
    body,
    headers = {},
    immediate = false,
    onSuccess,
    onError,
    showToast = true,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (executeOptions?: Partial<UseApiOptions<T>>): Promise<T | null> => {
      const finalOptions = { ...options, ...executeOptions };
      const finalUrl = finalOptions.url || url;
      const finalMethod = finalOptions.method || method;
      const finalBody = finalOptions.body || body;
      const finalHeaders = { ...headers, ...finalOptions.headers };
      const finalCacheKey = finalOptions.cacheKey || cacheKey;

      if (!finalUrl) {
        const error = 'URL is required for API call';
        setState(prev => ({ ...prev, error, loading: false }));
        if (showToast) toast.error(error);
        return null;
      }

      // Check cache for GET requests
      if (finalMethod === 'GET' && finalCacheKey) {
        const cached = cache.get(finalCacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          setState({
            data: cached.data,
            loading: false,
            error: null,
            isSuccess: true,
          });
          return cached.data;
        }
      }

      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null, isSuccess: false }));

      try {
        const token = localStorage.getItem('token');
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...finalHeaders,
        };

        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const requestOptions: RequestInit = {
          method: finalMethod,
          headers: requestHeaders,
          signal: abortControllerRef.current.signal,
        };

        if (finalBody && finalMethod !== 'GET') {
          requestOptions.body = JSON.stringify(finalBody);
        }

        const response = await fetch(finalUrl, requestOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            isSuccess: false,
          }));

          if (showToast) toast.error(errorMessage);
          finalOptions.onError?.(errorMessage);
          return null;
        }

        const data = await response.json();

        // Cache successful GET requests
        if (finalMethod === 'GET' && finalCacheKey) {
          cache.set(finalCacheKey, {
            data,
            timestamp: Date.now(),
          });
        }

        setState({
          data,
          loading: false,
          error: null,
          isSuccess: true,
        });

        if (showToast && finalMethod !== 'GET') {
          toast.success('Operation completed successfully');
        }

        finalOptions.onSuccess?.(data);
        return data;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return null; // Request was aborted
        }

        const errorMessage = error.message || 'An unexpected error occurred';
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isSuccess: false,
        }));

        if (showToast) toast.error(errorMessage);
        finalOptions.onError?.(error);
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [url, method, body, headers, onSuccess, onError, showToast, cacheKey, cacheTime]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, [immediate, url, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
};

export default useApi; 