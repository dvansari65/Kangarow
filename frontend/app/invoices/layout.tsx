import { MobileHeader } from '@/components/MobileHeader';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FBFF]">
      {/* Mobile top header — hidden on desktop */}
      <MobileHeader />

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main scrollable content area */}
      <main className="lg:ml-[240px] pt-14 lg:pt-0 px-4 sm:px-5 md:px-6 lg:px-8 py-6 lg:py-8 min-h-screen pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
