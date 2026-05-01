'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';

import { ClusterSwitcher } from '@/components/wallet/ClusterSwitcher';
import { useSolanaWallet } from '@/components/wallet/solana-wallet-provider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const {
    cluster,
    clusterLabel,
    setCluster,
    isConnected,
    shortAddress,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useSolanaWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your active Solana network and the wallet used for invoices, escrow releases, and checkout testing.
        </p>
      </div>

      <section className="rounded-2xl border border-[#E3F2FF] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Testing network</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            The selected network controls how this device creates invoices and sends transactions during testing. Current network: {clusterLabel}.
          </p>
        </div>
        <ClusterSwitcher cluster={cluster} onChange={setCluster} />
      </section>

      <section className="rounded-2xl border border-[#E3F2FF] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Wallet session</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Keep a connected wallet handy for creating invoices, funding them, and releasing escrow.
            </p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-medium ${isConnected ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#F8FBFF] text-[#64748B]'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="rounded-xl border border-[#F0F7FF] bg-[#F8FBFF] p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isConnected ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-white text-[#1565C0]'}`}>
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#0F172A]">
                {isConnected ? shortAddress : 'No wallet connected'}
              </div>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {isConnected ? `Ready on ${clusterLabel}` : 'Connect Phantom on mobile or desktop to continue.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnectWallet().catch(() => {})}
                className="rounded-xl border border-[#E3F2FF] px-4 py-2.5 text-sm font-medium text-[#334155] hover:bg-white"
              >
                Disconnect wallet
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="rounded-xl bg-[#4A9EFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-200 hover:bg-[#3B82F6] disabled:opacity-70"
              >
                {isConnecting ? 'Connecting...' : 'Connect wallet'}
              </button>
            )}
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#E3F2FF] px-4 py-2.5 text-center text-sm font-medium text-[#334155] hover:bg-[#F8FBFF]"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
