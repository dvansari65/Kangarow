'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '@/lib/solana-payflow';
import Link from 'next/link';
import { useSolanaWallet } from '@/components/wallet/solana-wallet-provider';
import { AuddLogo } from '@/components/AuddLogo';
import { toast } from 'sonner';
import { ShareModal } from '@/components/ShareModal';

export default function NewInvoicePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [useEscrow, setUseEscrow] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { wallet, connectWallet, isConnected, isConnecting, cluster, clusterLabel } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  const { mutate: handleCreate, isPending } = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect your wallet first.");
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      setStatusMessage('Preparing your invoice transaction on the testing network...');
      const id = await createInvoice(wallet, {
        amount: Number(amount),
        useEscrow,
        clientName: clientName.trim() || undefined
      }, cluster);
      return id;
    },
    onSuccess: (id) => {
      setStatusMessage(null);
      toast.success(`Invoice #${id} created successfully!`);
      setCreatedInvoiceId(id);
      setIsShareModalOpen(true);
    },
    onError: (error: Error) => {
      console.log("error:",error.message)
      setStatusMessage(null);
      toast.error('Failed to create invoice: ' + error.message);
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
          <div className="rounded-xl border border-[#D9EBFF] bg-[#F5FAFF] px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4A9EFF]">Testing network</div>
            <p className="mt-1 text-sm text-[#52637A]">
              This invoice will be created on <span className="font-medium text-[#0F172A]">{clusterLabel}</span>.
            </p>
          </div>

          <div className="rounded-xl border border-[#E3F2FF] bg-[#F8FBFF] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">Settlement network</div>
                <p className="text-xs text-[#64748B] mt-1">Invoices are created on Solana devnet for testing.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1565C0] border border-[#E3F2FF]">
                {clusterLabel}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A]">Amount (AUDD)</label>
              <div className="relative">
                <AuddLogo className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-70" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A]">Client Name (Optional)</label>
              <div className="relative">
                <input 
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-4 py-3 bg-white border border-[#E3F2FF] rounded-xl text-[#0F172A] font-medium focus:ring-2 focus:ring-[#4A9EFF] focus:outline-none transition-shadow"
                />
              </div>
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
            {statusMessage ? (
              <div className="mb-4 rounded-xl border border-[#D9EBFF] bg-[#F5FAFF] px-4 py-3 text-sm text-[#52637A]">
                {statusMessage}
              </div>
            ) : null}
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

      {createdInvoiceId && (
        <ShareModal
          invoiceId={createdInvoiceId}
          amount={amount}
          client={clientName.trim() || 'your client'}
          open={isShareModalOpen}
          onOpenChange={(open) => {
            setIsShareModalOpen(open);
            if (!open) {
              router.push('/dashboard');
            }
          }}
        />
      )}
    </div>
  );
}
