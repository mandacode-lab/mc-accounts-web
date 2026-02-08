import { QueryClient } from "@tanstack/react-query";

interface ApiError {
  response?: {
    status: number;
  };
  status?: number;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const err = error as ApiError;
        if (err?.response?.status === 401 || err?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

