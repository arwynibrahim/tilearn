import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthShowcase } from '@/components/auth/auth-showcase';
import { Brand } from '@/components/layout/brand';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Accédez à votre espace apprenant ou administrateur.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AuthShowcase />

      {/* Right: form */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Brand size={40} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
