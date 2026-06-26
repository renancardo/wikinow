import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { type ReactNode, useEffect } from 'react';

import { asyncStoragePersister } from '@/lib/async-storage-persister';
import { queryClient } from '@/lib/query-client';
import { setupQueryManagers } from '@/lib/setup-query-managers';

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
      }}>
      {children}
      {__DEV__ ? <ReactQueryDevTools /> : null}
    </PersistQueryClientProvider>
  );
}
