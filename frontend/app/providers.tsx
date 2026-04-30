'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SolanaWalletProvider } from '@/components/wallet/solana-wallet-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}
