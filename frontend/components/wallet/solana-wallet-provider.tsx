'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  type SolanaCluster,
  SOLANA_CLUSTER_LABELS,
  getStoredCluster,
} from '@/lib/solana-cluster';
import { getInjectedWallet, type PhantomProvider } from '@/lib/solana-payflow';

interface SolanaWalletContextValue {
  wallet: PhantomProvider | null;
  walletAddress: string | null;
  shortAddress: string | null;
  cluster: SolanaCluster;
  clusterLabel: string;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const SolanaWalletContext = createContext<SolanaWalletContextValue | null>(null);

const getAddressLabel = (wallet: PhantomProvider | null) => wallet?.publicKey?.toBase58() ?? null;

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null);
  const [cluster] = useState<SolanaCluster>(getStoredCluster);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const injected = getInjectedWallet();
    if (!injected) return;

    const handleAccountChange = (nextPublicKey: { toBase58: () => string } | null) => {
      if (!nextPublicKey) {
        setWallet(null);
        return;
      }

      setWallet(injected);
    };

    injected.connect({ onlyIfTrusted: true }).then(() => setWallet(injected)).catch(() => {});
    injected.on?.('accountChanged', handleAccountChange);
    injected.on?.('disconnect', () => setWallet(null));

    return () => {
      injected.off?.('accountChanged', handleAccountChange);
    };
  }, []);

  const connectWallet = React.useCallback(async () => {
    const injected = getInjectedWallet();

    if (!injected) {
      throw new Error('Phantom wallet not found. Install Phantom to continue.');
    }

    setIsConnecting(true);

    try {
      await injected.connect();
      setWallet(injected);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = React.useCallback(async () => {
    if (!wallet) return;
    await wallet.disconnect();
    setWallet(null);
  }, [wallet]);

  const walletAddress = getAddressLabel(wallet);

  const value = useMemo<SolanaWalletContextValue>(
    () => ({
      wallet,
      walletAddress,
      shortAddress: walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : null,
      cluster,
      clusterLabel: SOLANA_CLUSTER_LABELS[cluster],
      isConnected: !!walletAddress,
      isConnecting,
      connectWallet,
      disconnectWallet,
    }),
    [wallet, walletAddress, cluster, isConnecting, connectWallet, disconnectWallet],
  );

  return <SolanaWalletContext.Provider value={value}>{children}</SolanaWalletContext.Provider>;
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);

  if (!context) {
    throw new Error('useSolanaWallet must be used inside SolanaWalletProvider');
  }

  return context;
}
