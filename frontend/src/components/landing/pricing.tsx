'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useT } from '@/hooks/use-t';

export function PricingSection() {
  const t = useT();

  const plans = [
    {
      key: 'free',
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      features: [t('pricing.free.features.0'), t('pricing.free.features.1'), t('pricing.free.features.2')],
      popular: false,
      href: '/register',
    },
    {
      key: 'basic',
      name: t('pricing.basic.name'),
      price: t('pricing.basic.price'),
      features: [t('pricing.basic.features.0'), t('pricing.basic.features.1'), t('pricing.basic.features.2'), t('pricing.basic.features.3')],
      popular: false,
      href: '/register?plan=basic',
    },
    {
      key: 'pro',
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      features: [t('pricing.pro.features.0'), t('pricing.pro.features.1'), t('pricing.pro.features.2'), t('pricing.pro.features.3'), t('pricing.pro.features.4')],
      popular: true,
      href: '/register?plan=pro',
    },
    {
      key: 'enterprise',
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      features: [t('pricing.enterprise.features.0'), t('pricing.enterprise.features.1'), t('pricing.enterprise.features.2'), t('pricing.enterprise.features.3'), t('pricing.enterprise.features.4')],
      popular: false,
      href: '/contact',
    },
  ];

  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">{t('pricing.title')}</h2>
          <p className="text-lg text-gray-600">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative flex flex-col p-6 ${
                plan.popular
                  ? 'border-2 border-brand shadow-xl shadow-brand/10 scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand px-4 py-1 text-xs font-bold text-white shadow">
                    {t('pricing.most_popular')}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                  {plan.key !== 'free' && plan.key !== 'enterprise' && (
                    <span className="text-sm text-gray-500">{t('pricing.per_month')}</span>
                  )}
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('pricing.features')}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {t('pricing.cta')}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
