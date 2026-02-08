import { useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { postV1TokenRefresh } from "@/lib/api/auth";

/**
 * Global hook to handle automatic token refresh on 401 errors
 * Use this to wrap API mutations that need authentication
 */
export function useApiRefresh() {
  const isRefreshing = useRef(false);
  const refreshSubscribers = useRef<Array<(token: string) => void>>([]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // If already refreshing, queue the request
    if (isRefreshing.current) {
      return new Promise((resolve) => {
        refreshSubscribers.current.push((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing.current = true;

    try {
      const refreshResult = await postV1TokenRefresh();

      if (refreshResult.status === 200 && refreshResult.data.access_token) {
        const newAccessToken = refreshResult.data.access_token;

        // Update auth store with new token
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Notify all queued requests
        refreshSubscribers.current.forEach((callback) =>
          callback(newAccessToken),
        );
        refreshSubscribers.current = [];

        return newAccessToken;
      } else {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        return null;
      }
    } catch {
      // Refresh failed - logout user
      useAuthStore.getState().logout();
      return null;
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  const executeWithRefresh = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: unknown) => void;
      },
    ): Promise<T | null> => {
      try {
        const result = await apiCall();
        options?.onSuccess?.(result);
        return result;
      } catch (error: unknown) {
        // Check if it's a 401 error
        const err = error as {
          response?: { status?: number };
          status?: number;
          message?: string;
        };
        if (
          err?.response?.status === 401 ||
          err?.status === 401 ||
          err?.message?.includes("401")
        ) {
          // Try to refresh token
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Retry the original request with new token
            try {
              const result = await apiCall();
              options?.onSuccess?.(result);
              return result;
            } catch (retryError) {
              options?.onError?.(retryError);
              return null;
            }
          } else {
            // Refresh failed - user was logged out
            return null;
          }
        }

        // Other errors
        options?.onError?.(error);
        return null;
      }
    },
    [refreshAccessToken],
  );

  return { executeWithRefresh, refreshAccessToken };
}
