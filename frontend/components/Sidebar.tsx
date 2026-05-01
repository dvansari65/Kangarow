'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Download, Settings, Copy, Check, Wallet } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ClusterSwitcher } from './wallet/ClusterSwitcher';
import { useSolanaWallet } from './wallet/solana-wallet-provider';
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
    cluster,
    clusterLabel,
    setCluster,
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
      {/* Logo area */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4A9EFF] text-white rounded-lg flex items-center justify-center font-semibold text-sm">
            P
          </div>
          <span className="text-[#0F172A] text-lg font-semibold">Payflow</span>
        </div>
        <div className="text-[10px] text-[#94A3B8] tracking-wide ml-[36px]">
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

      <div className="mx-3 mb-4 rounded-2xl border border-[#D9EBFF] bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isConnected ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#F0F7FF] text-[#1565C0]'}`}>
              <Wallet size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-5 text-[#0F172A]">
                {isConnected ? 'Wallet connected' : 'Wallet disconnected'}
              </div>
              <div className="mt-0.5 text-[11px] leading-4 text-[#64748B]">
                {isConnected ? `Ready on ${clusterLabel}` : 'Connect before creating or releasing invoices'}
              </div>
            </div>
          </div>
          <div className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${isConnected ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#F8FBFF] text-[#64748B]'}`}>
            {isConnected ? 'Live' : 'Idle'}
          </div>
        </div>

        {isConnected ? (
          <div className="mb-3 rounded-xl border border-[#EAF2FF] bg-[#F8FBFF] px-3 py-2.5">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
              Wallet
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-mono text-xs text-[#475569]">{walletAddress}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-[#64748B] transition-colors hover:text-[#0F172A]"
                title="Copy address"
              >
                {copied ? <Check size={12} className="text-[#0EB07A]" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-3">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#94A3B8]">
            Testing network
          </div>
          <ClusterSwitcher cluster={cluster} onChange={setCluster} compact />
        </div>

        {isConnected ? (
          <button
            type="button"
            onClick={() => disconnectWallet().catch(() => {})}
            className="w-full rounded-xl border border-[#E3F2FF] bg-white px-3 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8FBFF]"
          >
            Disconnect wallet
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full rounded-xl bg-[#4A9EFF] px-3 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-200 transition-colors hover:bg-[#3B82F6] disabled:opacity-70"
          >
            {isConnecting ? 'Connecting...' : 'Connect wallet'}
          </button>
        )}
      </div>
    </div>
  );
}
