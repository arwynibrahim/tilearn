import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-hero px-4 text-center">
      <p className="text-7xl font-black text-brand">404</p>
      <div>
        <h1 className="mb-2 text-2xl font-black text-white">Page introuvable</h1>
        <p className="max-w-md text-gray-300">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link href="/">
        <Button size="lg">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
