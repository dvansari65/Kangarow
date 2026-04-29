'use client';

import React, { useState } from 'react';
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
  const cleanId = invoiceId.replace('#', '');
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://auddpayflow.com';
  
  const paymentLink = `${baseUrl}/pay/${cleanId}`;
  
  // The official Solana Pay encoded URL
  const solanaPayUrl = `solana:${baseUrl}/api/solana-pay/${cleanId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#E3F2FF] bg-white p-6 shadow-xl sm:rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-[#0F172A]">
              Share Invoice {invoiceId}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-[#64748B]">
              Send this link to {client} to collect {amount}.
            </Dialog.Description>
          </div>
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4 text-[#334155]" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-xl border border-[#E3F2FF] bg-[#F8FBFF] p-4 shadow-sm">
              <QRCodeSVG 
                value={solanaPayUrl} 
                size={200}
                bgColor={"#F8FBFF"}
                fgColor={"#0F172A"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#334155]">
              <QrCode className="h-4 w-4 text-[#4A9EFF]" />
              Scan with Phantom or Backpack
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#64748B]">Or share payment link</label>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-full items-center rounded-lg border border-[#E3F2FF] bg-[#F8FBFF] px-3 py-2 text-sm text-[#334155]">
                <LinkIcon className="mr-2 h-4 w-4 text-[#94A3B8]" />
                <span className="truncate">{paymentLink}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4A9EFF] px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
