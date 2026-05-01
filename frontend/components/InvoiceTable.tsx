'use client';

import React, { useState } from 'react';
import { Search, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ShareModal } from './ShareModal';
import { useMutation } from '@tanstack/react-query';
import { getInjectedWallet, releaseEscrow } from '@/lib/solana-payflow';
import { useSolanaWallet } from './wallet/solana-wallet-provider';
import { toast } from 'sonner';
import { AuddLogo } from './AuddLogo';

export interface UIInvoice {
  id: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  amount: string;
  date: string;
  status: 'pending' | 'funded' | 'paid' | 'cancelled';
  merchant: string;
  clientName:string
}

export function InvoiceTable({ invoices = [] }: { invoices?: UIInvoice[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [shareInvoice, setShareInvoice] = useState<UIInvoice | null>(null);
  const { wallet, connectWallet, cluster } = useSolanaWallet();

  const filters = ['All', 'Pending', 'In Escrow', 'Paid'];

  const filteredInvoices = invoices.filter(inv => {
    if (filter !== 'All') {
      if (filter === 'Pending' && inv.status.toLowerCase() !== 'pending') return false;
      if (filter === 'In Escrow' && inv.status.toLowerCase() !== 'funded') return false;
      if (filter === 'Paid' && inv.status.toLowerCase() !== 'paid') return false;
    }
    if (search && !inv.clientName.toLowerCase().includes(search.toLowerCase()) && !inv.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const { mutate: handleRelease, isPending, variables: pendingReleaseInv } = useMutation({
    mutationFn: async (inv: UIInvoice) => {
      let connectedWallet = wallet;
      if (!connectedWallet) {
        await connectWallet();
        connectedWallet = getInjectedWallet();
      }

      if (!connectedWallet) {
        throw new Error("Connect your wallet first.");
      }
      
      const cleanId = inv.id.replace('#', '');
      return releaseEscrow(connectedWallet, { invoiceId: cleanId, merchant: inv.merchant }, cluster);
    },
    onSuccess: () => {
      toast.success('Escrow released. The dashboard will refresh once the indexer syncs the event.');
    },
    onError: (error: Error) => {
      toast.error("Failed to release escrow: " + error.message);
    }
  });

  return (
    <div className="bg-white border border-[#E3F2FF] rounded-xl mb-6 overflow-hidden">
      <div className="p-4 lg:p-5 border-b border-[#E3F2FF] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="text-base font-semibold text-[#0F172A]">Invoices</div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[#99CAFF] text-[#1A4A8A] font-medium'
                  : 'text-[#64748B] hover:bg-[#F0F7FF]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E3F2FF] bg-[#F8FBFF] rounded-lg text-sm placeholder-[#94A3B8] focus:ring-2 focus:ring-[#99CAFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="block md:hidden">
        {filteredInvoices.map((inv) => (
          <div key={inv.id} className="px-4 py-3.5 border-b border-[#F0F7FF] last:border-0 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${inv.avatarBg} ${inv.avatarText}`}>
              {inv.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-[#0F172A] truncate">{inv.clientName}</span>
                <StatusBadge status={inv.status} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-0.5">
                {inv.id} · <div className="flex items-center gap-0.5"><AuddLogo className="w-3 h-3 text-[#64748B]" color="currentColor" />{inv.amount}</div>
              </div>
              <div className="text-xs text-[#94A3B8]">{inv.date}</div>
            </div>
            <div className="flex-shrink-0 ml-2">
              {inv.status === 'funded' && (
                <button 
                  onClick={() => handleRelease(inv)}
                  disabled={isPending && pendingReleaseInv?.id === inv.id}
                  className="bg-[#4A9EFF] text-white text-xs font-medium rounded-lg px-2.5 py-1.5 active:scale-[0.98] disabled:opacity-70 flex items-center gap-1"
                >
                  {isPending && pendingReleaseInv?.id === inv.id ? <Loader2 size={12} className="animate-spin" /> : null}
                  Release
                </button>
              )}
              {inv.status === 'pending' && (
                <button 
                  onClick={() => setShareInvoice(inv)}
                  className="p-2 text-[#64748B] hover:bg-[#F0F7FF] rounded-lg transition-colors"
                >
                  <Share2 size={16} />
                </button>
              )}
              {inv.status === 'paid' && (
                <button className="p-2 text-[#64748B] hover:bg-[#F0F7FF] rounded-lg transition-colors">
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredInvoices.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#64748B]">No invoices found in database.</div>
        )}
      </div>

      <table className="hidden md:table w-full">
        <thead className="bg-[#F8FBFF] border-b border-[#E3F2FF]">
          <tr>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Invoice #</th>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Client</th>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Amount</th>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Date</th>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Status</th>
            <th className="text-left text-xs text-[#94A3B8] uppercase tracking-wide px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((inv) => (
            <tr key={inv.id} className="border-b border-[#F0F7FF] hover:bg-[#F8FBFF] transition-colors last:border-0">
              <td className="px-5 py-4 font-mono text-sm text-[#0F172A] font-medium">{inv.id}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${inv.avatarBg} ${inv.avatarText}`}>
                    {inv.initials}
                  </div>
                  <span className="text-sm text-[#0F172A] font-medium">{inv.clientName}</span>
                </div>
              </td>
              <td className="px-5 py-4 font-medium text-[#0F172A] text-sm">
                <div className="flex items-center gap-1.5">
                  <AuddLogo className="w-4 h-4" />
                  {inv.amount}
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-[#64748B]">{inv.date}</td>
              <td className="px-5 py-4">
                <StatusBadge status={inv.status} />
              </td>
              <td className="px-5 py-4">
                {inv.status === 'funded' && (
                  <button 
                    onClick={() => handleRelease(inv)}
                    disabled={isPending && pendingReleaseInv?.id === inv.id}
                    className="bg-[#4A9EFF] text-white text-xs font-medium rounded-lg px-3 py-1.5 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-1.5 hover:bg-[#3B82F6]"
                  >
                    {isPending && pendingReleaseInv?.id === inv.id ? <Loader2 size={12} className="animate-spin" /> : null}
                    {isPending && pendingReleaseInv?.id === inv.id ? 'Confirming...' : 'Release funds'}
                  </button>
                )}
                {inv.status === 'pending' && (
                  <button 
                    onClick={() => setShareInvoice(inv)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors bg-white border border-[#E3F2FF] px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Share2 size={14} /> Share link
                  </button>
                )}
                {inv.status === 'paid' && (
                  <button className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors hover:bg-[#F0F7FF] px-3 py-1.5 rounded-lg">
                    <ExternalLink size={14} /> View receipt
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredInvoices.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#64748B]">No invoices found. Try creating one!</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="px-4 md:px-5 py-3 bg-[#F8FBFF] border-t border-[#E3F2FF] rounded-b-xl flex items-center justify-between">
        <div className="text-xs text-[#94A3B8]">Showing {filteredInvoices.length} of {invoices.length} invoices</div>
      </div>

      {shareInvoice && (
        <ShareModal 
          open={!!shareInvoice} 
          onOpenChange={(open) => !open && setShareInvoice(null)} 
          invoiceId={shareInvoice.id} 
          amount={shareInvoice.amount} 
          client={shareInvoice.clientName} 
        />
      )}
    </div>
  );
}
