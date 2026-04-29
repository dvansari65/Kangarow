'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Download, Settings, Copy, Check } from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const walletAddress = "9Ezz...BaQ1";
  const fullWalletAddress = "9EzzefVPa9QWgquqB3QNpUNxgdPPeJjgZkCuvGn8dndBa";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Bottom wallet chip */}
      <div className="m-4 mt-auto bg-[#0F172A] rounded-xl p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#0EB07A] rounded-full animate-pulse" />
            <span className="text-[10px] text-[#94A3B8]">Connected</span>
          </div>
          <span className="text-[10px] text-[#D1FAE5]">Mainnet</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#94A3B8]">{walletAddress}</span>
          <button
            onClick={handleCopy}
            className="text-[#64748B] hover:text-white transition-colors"
            title="Copy address"
          >
            {copied ? <Check size={12} className="text-[#0EB07A]" /> : <Copy size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
