'use client';

import { Building2, Check, LineChart, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/use-t';

const BULLET_ICONS = [Building2, LineChart, ShieldCheck];

export function ForOrganizationsSection() {
  const t = useT();

  const bullets = [t('organizations.bullet1'), t('organizations.bullet2'), t('organizations.bullet3')];

  return (
    <section className="bg-navy-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-3xl border border-white/10 bg-navy p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
              <Building2 className="size-3.5" aria-hidden="true" />
              TIL for Business
            </span>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              {t('organizations.title')}
            </h2>
            <p className="mb-8 text-lg text-gray-300">{t('organizations.subtitle')}</p>
            <a href="mailto:contact@total-innovation.net?subject=Formation%20pour%20mon%20organisation">
              <Button size="lg" className="gap-2 shadow-xl shadow-brand/30">
                {t('organizations.cta')}
              </Button>
            </a>
          </div>

          <ul className="space-y-4">
            {bullets.map((bullet, i) => {
              const Icon = BULLET_ICONS[i];
              return (
                <li key={bullet} className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex items-start gap-2 pt-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    <span className="text-sm text-gray-200">{bullet}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
