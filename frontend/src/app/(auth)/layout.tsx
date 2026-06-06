import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Accédez à votre espace apprenant ou administrateur.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
            <span className="text-base font-black text-white">T</span>
          </div>
          <span className="text-xl font-bold text-white">
            Total<span className="text-brand">Innovation</span>
          </span>
        </Link>

        <div>
          <blockquote className="mb-6 text-2xl font-bold leading-snug text-white">
            {"« Former l'Afrique de demain"}
            <br />
            {"par l'immersion VR & IA. »"}
          </blockquote>
          <div className="flex flex-col gap-4">
            {[
              { num: '5 000+', label: 'Apprenants actifs' },
              { num: '6', label: 'Simulations VR' },
              { num: '12', label: 'Cours certifiants' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-2xl font-black text-brand">{s.num}</span>
                <span className="text-gray-300">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Total Innovation Learning</p>
      </div>

      {/* Right: form */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <span className="text-sm font-black text-white">T</span>
            </div>
            <span className="font-bold text-navy">
              Total<span className="text-brand">Innovation</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
