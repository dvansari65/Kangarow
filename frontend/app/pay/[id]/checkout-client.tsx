'use client';

import React from 'react';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { payInvoice } from '@/lib/solana-payflow';
import { useSolanaWallet } from '@/components/wallet/solana-wallet-provider';
import { SOLANA_CLUSTER_LABELS, type SolanaCluster } from '@/lib/solana-cluster';

export function CheckoutClient({
  invoiceId,
  merchant,
  cluster,
}: {
  invoiceId: string;
  merchant: string;
  cluster: SolanaCluster;
}) {
  const { wallet, connectWallet, isConnected, isConnecting } = useSolanaWallet();
  const clusterLabel = SOLANA_CLUSTER_LABELS[cluster];

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  const { mutate: handlePay, isPending } = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect your wallet first.");
      
      const cleanId = invoiceId.replace('#', '');
      return payInvoice(wallet, {
        invoiceId: cleanId,
        merchant,
      }, cluster);
    },
    onSuccess: () => {
      alert('Payment successful!');
      window.location.reload();
    },
    onError: (error: Error) => {
      console.error(error);
      alert('Payment failed: ' + error.message);
    }
  });

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#E3F2FF] bg-white px-4 py-3 text-left">
          <div className="text-sm font-medium text-[#0F172A]">Paying on {clusterLabel}</div>
          <p className="mt-1 text-xs text-[#64748B]">Connect your wallet first. You can change clusters from the merchant dashboard menu if needed.</p>
        </div>
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98] shadow-lg shadow-slate-200 disabled:opacity-70"
        >
          <Wallet size={18} /> {isConnecting ? 'Connecting wallet...' : 'Connect Wallet to Pay'}
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => handlePay()}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-2 bg-[#4A9EFF] text-white rounded-xl py-3.5 font-medium transition-all shadow-lg shadow-blue-200 ${isPending ? 'opacity-80 cursor-not-allowed scale-[0.98]' : 'active:scale-[0.98] hover:bg-[#3B82F6]'}`}
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
      {isPending ? 'Processing payment...' : 'Pay with Wallet'}
      {!isPending && <ArrowRight size={18} />}
    </button>
  );
}
