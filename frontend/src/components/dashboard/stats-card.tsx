'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: string; positive: boolean };
  colorClass?: string;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  colorClass = 'bg-stat-brand',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={cn('flex size-12 items-center justify-center rounded-xl', colorClass)}>
          <Icon className="size-6 text-white" aria-hidden="true" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-gray-50 pt-3">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend.positive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-gray-400">vs mois dernier</span>
        </div>
      )}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton size-12 rounded-xl" />
      </div>
    </div>
  );
}
