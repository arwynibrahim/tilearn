'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Full-screen mode for the module player (no sidebar, no padding)
  if (pathname.startsWith('/learn')) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {children}
      </div>
    );
  }

  const variant = pathname.startsWith('/admin') ? 'admin' : 'learner';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar variant={variant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
