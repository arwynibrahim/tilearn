'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <span className="text-3xl">⚠️</span>
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-black text-gray-900">Une erreur est survenue</h1>
        <p className="max-w-md text-gray-500">
          Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Accueil
        </Button>
      </div>
    </div>
  );
}
