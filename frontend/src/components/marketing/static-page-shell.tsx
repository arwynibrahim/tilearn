import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface StaticPageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StaticPageShell({ title, subtitle, children }: StaticPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-black text-white">{title}</h1>
            {subtitle && <p className="mt-3 text-gray-400">{subtitle}</p>}
          </div>
        </section>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
