'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/learn')) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          aria-label="Contenu principal"
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl p-4 pt-20 lg:p-8 lg:pt-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
