import Link from 'next/link';

export default function InvoicesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-[#F0F7FF] rounded-full flex items-center justify-center mb-4">
        <span className="text-[#4A9EFF] text-2xl">📄</span>
      </div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">All Invoices</h1>
      <p className="text-[#64748B] mb-6 max-w-md">
        This view is currently under construction. Please use the dashboard to view and manage your recent invoices.
      </p>
      <Link href="/dashboard" className="bg-[#4A9EFF] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#3B82F6] transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
}
