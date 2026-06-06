'use client';

import Link from 'next/link';
import { ArrowRight, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/use-t';

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative overflow-hidden bg-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-700/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: text */}
          <div className="animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              <Zap className="size-4" />
              {t('hero.badge')}
            </div>

            <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              <span>{t('hero.title1')}</span>{' '}
              <span className="gradient-text">{t('hero.title2')}</span>
              <br />
              <span className="text-brand">{t('hero.title3')}</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-gray-300 leading-relaxed">
              {t('hero.desc')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-xl shadow-brand/30">
                  <Play className="size-5" />
                  {t('hero.cta_vr')}
                </Button>
              </Link>
              <Link href="/#courses">
                <Button size="lg" variant="white" className="gap-2">
                  {t('hero.cta_explore')}
                  <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { value: '5 000+', label: t('hero.stat_users') },
                { value: '12', label: t('hero.stat_courses') },
                { value: '6', label: t('hero.stat_vr') },
                { value: '8+', label: t('hero.stat_partners') },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-2xl font-black text-white">{s.value}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="relative hidden lg:block">
            <div className="glass relative rounded-3xl p-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-8 flex items-center justify-center">
                {/* VR headset SVG */}
                <svg viewBox="0 0 200 140" className="w-full max-w-xs" fill="none">
                  <rect x="20" y="35" width="160" height="80" rx="20" fill="#E8650A" opacity="0.15" />
                  <rect x="30" y="45" width="140" height="60" rx="16" fill="#E8650A" opacity="0.3" />
                  <rect x="50" y="55" width="45" height="40" rx="8" fill="#1A2A4A" />
                  <rect x="105" y="55" width="45" height="40" rx="8" fill="#1A2A4A" />
                  <circle cx="72" cy="75" r="15" fill="#E8650A" opacity="0.6" />
                  <circle cx="128" cy="75" r="15" fill="#E8650A" opacity="0.6" />
                  <rect x="85" y="70" width="30" height="10" rx="5" fill="#E8650A" opacity="0.4" />
                  {/* Strap */}
                  <path d="M20 75 Q10 75 10 65 Q10 20 100 20 Q190 20 190 65 Q190 75 180 75" stroke="#E8650A" strokeWidth="4" strokeOpacity="0.5" fill="none" />
                </svg>
              </div>
            </div>

            {/* Floating cards */}
            <div className="glass absolute -right-6 top-8 rounded-2xl p-4 text-white">
              <p className="text-xs text-gray-300">Simulation active</p>
              <p className="font-bold text-brand">Anatomie cardiaque</p>
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">VR en cours</span>
              </div>
            </div>

            <div className="glass absolute -left-6 bottom-8 rounded-2xl p-4 text-white">
              <p className="text-xs text-gray-300">Certificat obtenu</p>
              <p className="font-bold text-brand">Dev Fullstack</p>
              <p className="text-xs text-gray-400">Il y a 2 heures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
