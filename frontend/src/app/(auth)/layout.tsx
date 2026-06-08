import Link from 'next/link';
import Image from 'next/image';
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
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Total Innovation Learning"
            width={120}
            height={120}
            priority
            className="rounded-2xl"
          />
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
          <div className="mb-8 lg:hidden">
            <Image src="/logo.png" alt="Total Innovation Learning" width={56} height={56} className="rounded-xl" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
