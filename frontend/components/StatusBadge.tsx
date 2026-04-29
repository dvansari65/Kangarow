import React from 'react';

type Status = 'pending' | 'funded' | 'paid' | 'cancelled';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending:   { label: 'Pending',   bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
    funded:    { label: 'In escrow', bg: 'bg-[#E3F2FF]', text: 'text-[#1565C0]' },
    paid:      { label: 'Paid',      bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
    cancelled: { label: 'Cancelled', bg: 'bg-[#F1F5F9]', text: 'text-[#475569]' },
  };

  const { bg, text, label } = config[status] || config.pending;

  return (
    <span className={`${bg} ${text} text-xs font-medium px-2.5 py-1 rounded-full`}>
      {label}
    </span>
  );
}
