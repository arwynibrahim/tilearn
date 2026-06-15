'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingState({ message = 'Chargement...', className }: { message?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('py-12 text-center text-sm text-gray-400', className)}>
      <Loader2 className="mx-auto mb-2 size-5 animate-spin" aria-hidden="true" />
      {message}
    </div>
  );
}

export function ErrorBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div role="alert" className={cn('rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600', className)}>
      {message}
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
    <div className={cn('py-16 text-center', className)}>
      <Icon className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
      <p className="mb-4 text-gray-400">{title}</p>
      {description && <p className="mb-4 text-sm text-gray-400">{description}</p>}
      {action}
    </div>
  );
}
