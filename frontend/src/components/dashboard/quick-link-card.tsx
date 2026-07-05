'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickLinkCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass?: string;
}

export function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
  colorClass = 'bg-brand/10 text-brand',
}: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex size-12 items-center justify-center rounded-xl transition-colors', colorClass)}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}
