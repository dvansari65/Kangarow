'use client';

import { cn } from '@/lib/utils';
import { SOLANA_CLUSTERS, SOLANA_CLUSTER_LABELS, type SolanaCluster } from '@/lib/solana-cluster';

interface ClusterSwitcherProps {
  cluster: SolanaCluster;
  onChange: (cluster: SolanaCluster) => void;
  className?: string;
  compact?: boolean;
}

export function ClusterSwitcher({ cluster, onChange, className }: ClusterSwitcherProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        value={cluster}
        onChange={(e) => onChange(e.target.value as SolanaCluster)}
        className="w-full appearance-none rounded-xl border border-[#E3F2FF] bg-[#F8FBFF] px-3 py-2.5 pr-8 text-xs font-medium text-[#475569] outline-none transition-colors hover:bg-[#F0F7FF] focus:border-[#4A9EFF] focus:ring-2 focus:ring-[#4A9EFF]/20"
      >
        {SOLANA_CLUSTERS.map((option) => (
          <option key={option} value={option}>
            {SOLANA_CLUSTER_LABELS[option]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8]">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
