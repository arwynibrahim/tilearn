'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Briefcase, Code2, Headphones, HeartPulse, Sprout, type LucideIcon } from 'lucide-react';
import { catalogueApi } from '@/lib/api/catalogue';
import { useT } from '@/hooks/use-t';

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  dev: Code2,
  sante: HeartPulse,
  agro: Sprout,
  business: Briefcase,
  vr: Headphones,
};

const FALLBACK_DOMAINS = [
  { id: 'dev', slug: 'dev', name: 'Développement' },
  { id: 'sante', slug: 'sante', name: 'Santé' },
  { id: 'agro', slug: 'agro', name: 'Agro' },
  { id: 'business', slug: 'business', name: 'Business' },
];

export function CategoriesSection() {
  const t = useT();

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
    retry: false,
  });

  const items = domains?.length ? domains : FALLBACK_DOMAINS;

  return (
    <section id="categories" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-black text-gray-900 sm:text-3xl">
            {t('categories.title')}
          </h2>
          <p className="text-gray-600">{t('categories.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((d) => {
            const Icon = ICON_BY_SLUG[d.slug] ?? BookOpen;
            return (
              <Link
                key={d.id}
                href={`/courses?domain=${encodeURIComponent(d.slug)}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-semibold text-gray-900">{d.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
