'use client';

import { cn } from '@/lib/utils';
import { SOLANA_CLUSTERS, SOLANA_CLUSTER_LABELS, type SolanaCluster } from '@/lib/solana-cluster';

interface ClusterSwitcherProps {
  cluster: SolanaCluster;
  onChange: (cluster: SolanaCluster) => void;
  compact?: boolean;
}

export function ClusterSwitcher({ cluster, onChange, compact = false }: ClusterSwitcherProps) {
  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3')}>
      {SOLANA_CLUSTERS.map((option) => {
        const active = option === cluster;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'w-full min-w-0 rounded-xl border px-3 py-2 text-sm transition-colors',
              active
                ? 'border-[#4A9EFF] bg-[#EAF4FF] text-[#1565C0] shadow-sm'
                : 'border-[#E3F2FF] bg-white text-[#64748B] hover:bg-[#F8FBFF]',
              compact && 'px-3 py-2 text-left text-xs font-medium',
            )}
          >
            {SOLANA_CLUSTER_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
