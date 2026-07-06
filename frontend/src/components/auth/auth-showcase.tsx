'use client';

import Image from 'next/image';
import { Zap } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { useT } from '@/hooks/use-t';

const STATS = [
  { value: '5 000+', key: 'hero.stat_users' },
  { value: '12', key: 'hero.stat_courses' },
  { value: '6', key: 'hero.stat_vr' },
] as const;

export function AuthShowcase() {
  const t = useT();

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
      <Image
        src="/images/img1.jpg"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/90 via-navy-800/85 to-navy-900/95" />
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />

      <div className="relative">
        <Brand size={44} textClassName="text-white" />
      </div>

      <div className="relative">
        <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white">
          <Zap className="size-3.5 text-brand" aria-hidden="true" />
          {t('auth.showcase_badge')}
        </div>

        <blockquote className="mb-8 max-w-sm text-2xl font-bold leading-snug text-white">
          {t('auth.quote')}
        </blockquote>

        <div className="flex flex-col gap-4">
          {STATS.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-2xl font-black text-brand">{s.value}</span>
              <span className="text-gray-300">{t(s.key)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-gray-400">
        © {new Date().getFullYear()} Total Innovation Learning
      </p>
    </div>
  );
}
