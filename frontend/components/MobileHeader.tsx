'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { UserButton } from '@clerk/nextjs';
import { useSolanaWallet } from './wallet/solana-wallet-provider';
import { Logo } from './ui/logo';
import { toast } from 'sonner';

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { connectWallet, isConnected, isConnecting, shortAddress } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 block border-b border-[#E3F2FF] bg-white/95 backdrop-blur-sm lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:px-4">
          <SheetTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#334155] transition-colors hover:bg-[#F0F7FF]">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <div className="flex min-w-0 justify-center">
            {open ? <Logo tone="dark" size="nav" className="h-5 max-w-[132px]" /> : null}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
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
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A9EFF] text-white transition-transform active:scale-[0.98]">
                <Plus size={16} />
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <SheetContent side="left" className="w-[min(86vw,280px)] p-0">
          <DialogPrimitive.Title className="sr-only">Navigation Menu</DialogPrimitive.Title>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>
    </div>
  );
}
