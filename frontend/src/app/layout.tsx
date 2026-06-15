import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'),
  title: {
    default: 'Total Innovation Learning - VR & IA e-learning',
    template: '%s | Total Innovation Learning',
  },
  description:
    "La première plateforme e-learning d'Afrique francophone combinant réalité virtuelle, IA et Mobile Money.",
  keywords: ['e-learning', 'VR', 'formation', 'Afrique', 'réalité virtuelle'],
  openGraph: {
    title: 'Total Innovation Learning',
    description: "Former l'Afrique de demain par l'immersion",
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
