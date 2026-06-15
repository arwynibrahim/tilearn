'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="bg-hero py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
          Prêt à transformer votre carrière ?
        </h2>
        <p className="mb-8 text-lg text-gray-200">
          Rejoignez 5 000+ professionnels qui apprennent par l&apos;immersion VR.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="xl" className="gap-2 shadow-xl shadow-brand/30">
              Commencer gratuitement
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <Link href="mailto:contact@totalinnovation.bf">
            <Button size="xl" variant="white" className="gap-2">
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
