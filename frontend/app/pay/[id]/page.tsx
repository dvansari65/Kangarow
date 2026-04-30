import React from 'react';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ShieldCheck } from 'lucide-react';
import { CheckoutClient } from './checkout-client';
import { SOLANA_CLUSTER_LABELS, getDefaultCluster, isSolanaCluster, type SolanaCluster } from '@/lib/solana-cluster';

const prisma = new PrismaClient();

export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cluster?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const cluster: SolanaCluster = isSolanaCluster(resolvedSearchParams.cluster)
    ? resolvedSearchParams.cluster
    : getDefaultCluster();
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: id as string }
  });

  if (!invoice) {
    // If not found in DB, we could fallback to mock data or return 404. We will return 404 for production.
    notFound();
  }

  // Convert BigInt to string/number for frontend (assuming 6 decimals for AUDD)
  const amountNumber = Number(invoice.amount) / 1_000_000;
  
  return (
    <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E3F2FF] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-[#F0F7FF] bg-gradient-to-b from-[#F0F7FF]/50 to-white">
          <div className="w-12 h-12 bg-[#4A9EFF] text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-sm">
            P
          </div>
          <h1 className="text-sm font-semibold uppercase tracking-widest text-[#64748B] mb-1">
            Payment Request
          </h1>
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
            {amountNumber.toLocaleString('en-US', { style: 'currency', currency: 'AUD' })}
          </h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F2FF] text-[#1565C0] text-xs font-medium">
            <ShieldCheck size={14} />
            {invoice.useEscrow ? 'Escrow Protected' : 'Direct Settlement'}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B]">Invoice ID</span>
            <span className="font-mono font-medium text-[#0F172A]">#{invoice.id}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B]">Merchant Wallet</span>
            <span className="font-mono text-xs text-[#0F172A] bg-[#F8FBFF] px-2 py-1 rounded border border-[#E3F2FF]">
              {invoice.merchant.slice(0, 4)}...{invoice.merchant.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B]">Network</span>
            <span className="font-medium text-[#0F172A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0EB07A]"></span>
              Solana {SOLANA_CLUSTER_LABELS[cluster]}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B]">Status</span>
            <span className={`font-medium capitalize ${invoice.status.toLowerCase() === 'pending' ? 'text-[#F6A623]' : 'text-[#0EB07A]'}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-[#F8FBFF] border-t border-[#F0F7FF]">
          {invoice.status.toLowerCase() === 'pending' ? (
            <CheckoutClient invoiceId={invoice.id} merchant={invoice.merchant} cluster={cluster} />
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-[#D1FAE5] text-[#065F46] rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] mb-1">Invoice already {invoice.status.toLowerCase()}</h3>
              <p className="text-sm text-[#64748B]">This invoice does not require further payment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
