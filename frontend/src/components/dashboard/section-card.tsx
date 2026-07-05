'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  icon?: React.ElementType;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white shadow-card', className)}>
      <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          {Icon && <Icon className="size-4 text-brand" aria-hidden="true" />}
          {title}
        </h2>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className={cn('p-6', contentClassName)}>{children}</div>
    </div>
  );
}

export function SectionCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
      <div className="border-b border-gray-50 px-6 py-4">
        <div className="skeleton h-5 w-40" />
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-3/5" />
              <div className="skeleton h-3 w-2/5" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
