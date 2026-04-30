'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '@/lib/solana-payflow';
import Link from 'next/link';
import { useSolanaWallet } from '@/components/wallet/solana-wallet-provider';
import { ClusterSwitcher } from '@/components/wallet/ClusterSwitcher';
import { toast } from 'sonner';

export default function NewInvoicePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [useEscrow, setUseEscrow] = useState(true);
  const { wallet, connectWallet, isConnected, isConnecting, cluster, clusterLabel, setCluster } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  const { mutate: handleCreate, isPending } = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect your wallet first.");
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      
      const id = await createInvoice(wallet, {
        amount: Number(amount),
        useEscrow
      }, cluster);
      return id;
    },
    onSuccess: (id) => {
      toast.success(`Invoice #${id} created successfully on the blockchain!\n\nYour indexer will detect the event and add it to the dashboard momentarily.`)
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      console.log("error:",error.message)
      toast.error('Failed to create invoice: ' + error.message)
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      <div className="bg-white border border-[#E3F2FF] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F0F7FF] bg-[#F8FBFF]">
          <h1 className="text-xl font-semibold text-[#0F172A]">Create New Invoice</h1>
          <p className="text-sm text-[#64748B] mt-1">Generate a secure payment request on Solana.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-[#E3F2FF] bg-[#F8FBFF] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">Settlement network</div>
                <p className="text-xs text-[#64748B] mt-1">Choose the cluster before creating the on-chain invoice.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1565C0] border border-[#E3F2FF]">
                {clusterLabel}
              </div>
            </div>
            <ClusterSwitcher cluster={cluster} onChange={setCluster} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A]">Amount (AUDD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">A$</span>
              <input 
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E3F2FF] rounded-xl text-[#0F172A] font-medium focus:ring-2 focus:ring-[#4A9EFF] focus:outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="p-4 border border-[#E3F2FF] bg-[#F8FBFF] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0EB07A]" />
                  <label className="text-sm font-semibold text-[#0F172A]">Use Escrow Protection</label>
                </div>
                <p className="text-xs text-[#64748B]">Funds will be locked in a smart contract vault until you complete the work.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={useEscrow}
                  onChange={(e) => setUseEscrow(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[#E2E8F0] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4A9EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CBD5E1] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EB07A]"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F7FF]">
            {!isConnected ? (
              <button 
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98] shadow-md shadow-slate-200"
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting wallet...' : 'Connect wallet to create'}
              </button>
            ) : (
              <button 
                onClick={() => handleCreate()}
                disabled={isPending || !amount}
                className={`w-full flex items-center justify-center gap-2 bg-[#4A9EFF] text-white rounded-xl py-3.5 font-medium transition-all shadow-md shadow-blue-200 ${
                  (isPending || !amount) ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'active:scale-[0.98] hover:bg-[#3B82F6]'
                }`}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isPending ? 'Confirming transaction...' : 'Create Invoice'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
