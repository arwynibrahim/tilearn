'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingState({ message = 'Chargement...', className }: { message?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center py-12 text-sm text-gray-400', className)}>
      <Loader2 className="mb-3 size-5 animate-spin text-brand" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div role="alert" className={cn('rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700', className)}>
      <p className="font-medium">Une erreur est survenue</p>
      <p className="mt-1 text-red-500">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center py-16 text-center', className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gray-50">
        <Icon className="size-8 text-gray-300" aria-hidden="true" />
      </div>
      <p className="mb-1 text-base font-semibold text-gray-900">{title}</p>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-400">{description}</p>}
      {action}
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton h-10 w-full', className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white p-6 shadow-card', className)}>
      <div className="skeleton mb-4 h-5 w-2/5" />
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow className="w-4/5" />
      </div>
    </div>
  );
}
