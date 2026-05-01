import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  footer: React.ReactNode;
  footerColor: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export function StatCard({
  label,
  value,
  footer,
  footerColor,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#E3F2FF] rounded-xl p-4 lg:p-5 shadow-sm">
      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-[18px] h-[18px] lg:w-5 lg:h-5 ${iconColor}`} />
      </div>
      <h3 className="text-xl lg:text-2xl font-semibold text-[#0F172A] mt-3 mb-0.5">{value}</h3>
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className={`text-xs ${footerColor} mt-2 flex items-center gap-1`}>
        {footer}
      </p>
    </div>
  );
}
