import Link from 'next/link';
import { Plus, TrendingUp, Clock, Shield, CheckCircle, Activity, Download } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { InvoiceTable } from '@/components/InvoiceTable';
import { QuickCopyAction } from '@/components/QuickCopyAction';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function DashboardPage({ params }: { params: Promise<any> }) {
  await params;

  let rawInvoices: any[] = [];
  let dbError = false;

  try {
    rawInvoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Database Connection Error: ", error);
    dbError = true;
  }

  // Map database entries to UI format
  const invoices = rawInvoices.map((inv) => {
    const amountNumber = Number(inv.amount) / 1_000_000;
    const clientName = inv.payer ? `${inv.payer.slice(0,4)}...${inv.payer.slice(-4)}` : 'Anonymous Client';
    
    // Quick random color hash based on ID for the avatar
    const colorHash = inv.id.charCodeAt(0) % 3;
    const bgColors = ['bg-[#E3F2FF]', 'bg-[#FEF3C7]', 'bg-[#D1FAE5]'];
    const textColors = ['text-[#1565C0]', 'text-[#92400E]', 'text-[#065F46]'];

    return {
      id: `#${inv.id}`,
      client: clientName,
      initials: inv.payer ? inv.payer.slice(0, 2).toUpperCase() : 'AN',
      avatarBg: bgColors[colorHash],
      avatarText: textColors[colorHash],
      amount: amountNumber.toLocaleString('en-US', { style: 'currency', currency: 'AUD' }),
      date: new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: inv.status.toLowerCase() as any,
      merchant: inv.merchant,
    };
  });

  // Calculate totals
  const totalEarned = rawInvoices
    .filter(i => i.status.toLowerCase() === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000), 0);

  const pendingAmount = rawInvoices
    .filter(i => i.status.toLowerCase() === 'pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000), 0);

  const escrowAmount = rawInvoices
    .filter(i => i.status.toLowerCase() === 'funded')
    .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000), 0);

  const pendingCount = rawInvoices.filter(i => i.status.toLowerCase() === 'pending').length;
  const escrowCount = rawInvoices.filter(i => i.status.toLowerCase() === 'funded').length;
  const paidCount = rawInvoices.filter(i => i.status.toLowerCase() === 'paid').length;

  return (
    <div className="max-w-7xl mx-auto">
      {dbError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Could not connect to the PostgreSQL database at localhost:5432. Please ensure your local database container or service is running. The dashboard is currently displaying offline zero-states.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-[#0F172A]">
            Good morning, Merchant
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Here's what's happening with your invoices.
          </p>
        </div>
        <Link href="/invoices/new">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4A9EFF] text-white rounded-lg px-4 py-2.5 text-sm font-medium active:scale-[0.98] transition-transform shadow-md shadow-blue-200">
            <Plus size={16} /> New invoice
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <StatCard
          label="Total earned"
          value={`A$${totalEarned.toLocaleString()}`}
          footer="All time revenue"
          footerColor="text-[#0EB07A]"
          icon={TrendingUp}
          iconBg="bg-[#E3F2FF]"
          iconColor="text-[#4A9EFF]"
        />
        <StatCard
          label="Pending payment"
          value={pendingCount.toString()}
          footer={`A$${pendingAmount.toLocaleString()} outstanding`}
          footerColor="text-[#F6A623]"
          icon={Clock}
          iconBg="bg-[#FEF3C7]"
          iconColor="text-[#F6A623]"
        />
        <StatCard
          label="In escrow"
          value={`A$${escrowAmount.toLocaleString()}`}
          footer={`${escrowCount} invoices funded`}
          footerColor="text-[#4A9EFF]"
          icon={Shield}
          iconBg="bg-[#E3F2FF]"
          iconColor="text-[#4A9EFF]"
        />
        <StatCard
          label="Paid invoices"
          value={paidCount.toString()}
          footer="Successfully settled"
          footerColor="text-[#0EB07A]"
          icon={CheckCircle}
          iconBg="bg-[#D1FAE5]"
          iconColor="text-[#0EB07A]"
        />
      </div>

      <InvoiceTable invoices={invoices} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E3F2FF] rounded-xl p-4 lg:p-5 lg:col-span-2 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#4A9EFF]" />
            <h2 className="text-base font-semibold text-[#0F172A]">Recent activity</h2>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start gap-3 py-3 border-b border-[#F0F7FF]">
              <div className="w-2 h-2 rounded-full bg-[#99CAFF] mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0F172A] truncate">System is now monitoring blockchain events</p>
                <p className="text-xs text-[#64748B] mt-0.5">Real-time sync enabled</p>
              </div>
              <span className="text-xs text-[#94A3B8] flex-shrink-0 mt-0.5">Just now</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E3F2FF] rounded-xl p-4 lg:p-5 lg:col-span-1 shadow-sm h-fit">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">Quick actions</h2>
          <div className="flex flex-col gap-2.5">
            <Link href="/invoices/new" className="w-full">
              <button className="bg-[#4A9EFF] text-white rounded-lg py-2.5 text-sm font-medium w-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                <Plus size={16} /> New invoice
              </button>
            </Link>
            <Link href="/export" className="w-full">
              <button className="bg-white border border-[#E3F2FF] text-[#334155] rounded-lg py-2.5 text-sm font-medium w-full flex items-center justify-center gap-2 hover:bg-[#F8FBFF] transition-colors active:scale-[0.98]">
                <Download size={16} className="text-[#4A9EFF]" /> Export CSV
              </button>
            </Link>
            <QuickCopyAction />
          </div>
        </div>
      </div>
    </div>
  );
}
