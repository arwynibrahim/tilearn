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

  const variant = pathname.startsWith('/admin') ? 'admin' : 'learner';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          aria-label="Contenu principal"
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
