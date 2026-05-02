'use client';

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, QrCode, Link as LinkIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  invoiceId: string;
  amount: string;
  client: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ invoiceId, amount, client, open, onOpenChange }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://auddpayflow.com';
    }

    return window.location.origin;
  }, []);

  const cleanId = invoiceId.replace(/^#/, '');

  const paymentLink = `${baseUrl}/pay/${cleanId}`;
  
  const apiUrl = new URL(`${baseUrl}/api/solana-pay/${cleanId}`);
  const solanaPayUrl = `solana:${encodeURIComponent(apiUrl.toString())}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E3F2FF] bg-white p-5 shadow-xl sm:p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          
          {/* Header */}
          <div className="pr-8">
            <Dialog.Title className="text-base font-semibold text-[#0F172A] sm:text-lg">
              Share Invoice {invoiceId}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[#64748B]">
              Send this link to {client} to collect {amount}.
            </Dialog.Description>
          </div>

          {/* Close Button */}
          <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]">
            <X className="h-4 w-4 text-[#334155]" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* QR Code — always centered */}
          <div className="my-6 flex flex-col items-center gap-3">
            <div className="rounded-xl border border-[#E3F2FF] bg-[#F8FBFF] p-4">
              <QRCodeSVG
                value={solanaPayUrl}
                size={180}
                bgColor="#F8FBFF"
                fgColor="#0F172A"
                level="L"
                includeMargin={false}
              />
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-[#334155]">
              <QrCode className="h-4 w-4 text-[#4A9EFF]" />
              Scan with Phantom or Backpack
            </p>
          </div>

          {/* Link Row */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#64748B]">Or share payment link</label>
            <div className="flex items-center gap-2">
              {/* URL box — min-w-0 + truncate fixes overflow */}
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E3F2FF] bg-[#F8FBFF] px-3 py-2">
                <LinkIcon className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                <span className="truncate text-sm text-[#334155]">{paymentLink}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#4A9EFF] px-3 text-sm font-medium text-white transition-transform active:scale-[0.98] sm:px-4"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
