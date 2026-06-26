import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 2,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}

export const queryClient = createQueryClient();
