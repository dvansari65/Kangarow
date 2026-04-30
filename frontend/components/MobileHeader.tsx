'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { UserButton } from '@clerk/nextjs';
import { useSolanaWallet } from './wallet/solana-wallet-provider';

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { connectWallet, isConnected, isConnecting, shortAddress } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-sm border-b border-[#E3F2FF] flex items-center justify-between px-4 block lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="text-[#334155] w-10 h-10 -ml-2 rounded-lg hover:bg-[#F0F7FF] transition-colors flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          {/* Add a hidden title for accessibility, required by Radix Dialog */}
          <DialogPrimitive.Title className="sr-only">Navigation Menu</DialogPrimitive.Title>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#4A9EFF] text-white rounded-md flex items-center justify-center font-semibold text-xs">
          P
        </div>
        <span className="text-[#0F172A] font-semibold text-base">Payflow</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnected || isConnecting}
          className={`max-w-[132px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            isConnected
              ? 'border-[#D1FAE5] bg-[#ECFDF5] text-[#047857]'
              : 'border-[#E3F2FF] bg-[#F8FBFF] text-[#1565C0] active:scale-[0.98]'
          } ${isConnecting ? 'opacity-70' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            {isConnected ? shortAddress : isConnecting ? 'Connecting...' : 'Connect'}
          </span>
        </button>
        <Link href="/invoices/new">
          <button className="bg-[#4A9EFF] text-white w-8 h-8 rounded-lg flex items-center justify-center active:scale-[0.98] transition-transform">
            <Plus size={16} />
          </button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
