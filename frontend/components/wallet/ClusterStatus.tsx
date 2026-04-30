'use client';

import { useSolanaWallet } from './solana-wallet-provider';

export function ClusterStatus() {
  const { clusterLabel } = useSolanaWallet();

  return (
    <span className="font-medium text-[#0F172A] flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#0EB07A]"></span>
      Solana {clusterLabel}
    </span>
  );
}
