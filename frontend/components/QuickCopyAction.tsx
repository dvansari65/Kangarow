'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function QuickCopyAction() {
  const [copied, setCopied] = useState(false);
  const fullWalletAddress = "9EzzefVPa9QWgquqB3QNpUNxgdPPeJjgZkCuvGn8dndBa";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-white border border-[#E3F2FF] text-[#334155] rounded-lg py-2.5 text-sm font-medium w-full flex items-center justify-center gap-2 hover:bg-[#F8FBFF] transition-colors active:scale-[0.98]"
    >
      {copied ? (
        <>
          <Check size={16} className="text-[#0EB07A]" /> Copied!
        </>
      ) : (
        <>
          <Copy size={16} className="text-[#4A9EFF]" /> Copy wallet address
        </>
      )}
    </button>
  );
}
