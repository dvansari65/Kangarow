'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Download, Settings, Copy, Check, Wallet } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useSolanaWallet } from './wallet/solana-wallet-provider';
import { Logo } from './ui/logo';
import { toast } from 'sonner';

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const {
    walletAddress,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    clusterLabel,
  } = useSolanaWallet();

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Invoices", href: "/invoices" },
    { icon: Download, label: "Export", href: "/export" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const containerClasses = isMobile
    ? "flex flex-col h-full bg-[#F8FBFF]" // Inside mobile sheet
    : "fixed left-0 top-0 h-screen w-[240px] bg-[#F8FBFF] border-r border-[#E3F2FF] hidden lg:flex flex-col"; // Desktop

  return (
    <div className={containerClasses}>
      <div className="px-3 pt-5 pb-4 sm:pt-6 sm:pb-5">
        <Link
          href="/"
          className="flex h-10 items-center "
        >
          <Logo
            tone="dark"
            size="nav"
            className={`h-5 sm:h-6 ${isMobile ? 'max-w-[148px]' : 'max-w-[156px]'}`}
          />
        </Link>
        <div className="mt-2 px-3 text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">
          AUDD · Solana
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-5 mt-4 mb-1">
        <span className="text-[10px] text-[#94A3B8] tracking-widest font-medium uppercase">
          MENU
        </span>
      </div>

      {/* Nav items */}
      <div className="px-3 gap-0.5 flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E3F2FF] text-[#1565C0] font-medium'
                    : 'text-[#334155] hover:bg-[#F0F7FF]'
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-[#4A9EFF]' : 'text-[#94A3B8]'}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* User profile section */}
      <div className="px-5 mb-2 flex items-center gap-3 bg-[#F0F7FF] py-3 mx-3 rounded-lg border border-[#E3F2FF]">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm font-medium text-[#0F172A] truncate">My Account</span>
      </div>

      <div className="mx-3 mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-xl border border-[#E3F2FF] bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isConnected ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#F0F7FF] text-[#1565C0]'}`}>
              <Wallet size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-[#0F172A]">
                {isConnected ? walletAddress?.slice(0, 4) + '...' + walletAddress?.slice(-4) : 'Disconnected'}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#64748B]">
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-[#0EB07A]' : 'bg-[#94A3B8]'}`} />
                {isConnected ? 'Live' : 'Idle'}
              </div>
            </div>
          </div>
          
          <div className="flex shrink-0 gap-1.5">
            {isConnected ? (
               <>
                 <button onClick={handleCopy} title="Copy address" className="rounded-lg bg-[#F8FBFF] p-2 text-[#64748B] transition-colors hover:bg-[#F0F7FF] hover:text-[#0F172A]">
                   {copied ? <Check size={14} className="text-[#0EB07A]" /> : <Copy size={14} />}
                 </button>
                 <button onClick={() => disconnectWallet().catch(() => {})} title="Disconnect" className="rounded-lg bg-[#F8FBFF] p-2 text-[#64748B] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                 </button>
               </>
            ) : (
              <button onClick={handleConnect} disabled={isConnecting} className="rounded-lg bg-[#4A9EFF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3B82F6] disabled:opacity-70">
                {isConnecting ? '...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border border-[#E3F2FF] bg-white px-3 py-2 text-xs font-medium text-[#1565C0] shadow-sm">
          Solana {clusterLabel}
        </div>
      </div>
    </div>
  );
}
