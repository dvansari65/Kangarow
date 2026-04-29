'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { payInvoice, getInjectedWallet, type PhantomProvider } from '@/lib/solana-payflow';

export function CheckoutClient({ invoiceId, amount, useEscrow, merchant }: { invoiceId: string, amount: number, useEscrow: boolean, merchant: string }) {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null);

  useEffect(() => {
    // Attempt silent connect if user has previously trusted the app
    const injected = getInjectedWallet();
    if (injected) {
      injected.connect({ onlyIfTrusted: true })
        .then(() => setWallet(injected))
        .catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    const injected = getInjectedWallet();
    if (!injected) {
      alert("Phantom wallet not found. Please install the extension.");
      return;
    }
    try {
      await injected.connect();
      setWallet(injected);
    } catch (e: any) {
      alert("Connection failed: " + e.message);
    }
  }

  const { mutate: handlePay, isPending } = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect your wallet first.");
      
      const cleanId = invoiceId.replace('#', '');
      return payInvoice(wallet, {
        invoiceId: cleanId,
        merchant,
      });
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

  if (!wallet?.publicKey) {
    return (
      <button 
        onClick={connectWallet}
        className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98] shadow-lg shadow-slate-200"
      >
        <Wallet size={18} /> Connect Wallet to Pay
      </button>
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
