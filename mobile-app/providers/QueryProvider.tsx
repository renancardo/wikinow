import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { type ReactNode, useEffect } from 'react';

import { LIVE_QUERY_KEY } from '@/lib/live/stream-query';
import { asyncStoragePersister } from '@/lib/query/async-storage-persister';
import { queryClient } from '@/lib/query/query-client';
import { setupQueryManagers } from '@/lib/query/setup-query-managers';

type QueryProviderProps = {
  children: ReactNode;
};

function ReactQueryDevTools() {
  useReactQueryDevTools(queryClient);
  return null;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    setupQueryManagers();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.queryKey[0] !== LIVE_QUERY_KEY[0],
        },
      }}>
      {children}
      {__DEV__ ? <ReactQueryDevTools /> : null}
    </PersistQueryClientProvider>
  );
}
