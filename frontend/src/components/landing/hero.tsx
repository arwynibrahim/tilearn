'use client';

import Link from 'next/link';
import { ArrowRight, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/use-t';

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/85 via-navy-800/80 to-navy-900/90" />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-700/30 blur-3xl" />
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

            <p className="mb-8 max-w-lg text-lg text-gray-200 leading-relaxed">
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
                  <span className="text-xs text-gray-300">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="relative hidden lg:block">
            <div className="glass overflow-hidden rounded-3xl">
              <video
                className="aspect-square w-full object-cover"
                src="/videos/videoplayback.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            {/* Floating cards */}
            <div className="glass absolute -right-6 top-8 rounded-2xl p-4 text-white">
              <p className="text-xs text-gray-200">Simulation active</p>
              <p className="font-bold text-brand">Anatomie cardiaque</p>
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">VR en cours</span>
              </div>
            </div>

            <div className="glass absolute -left-6 bottom-8 rounded-2xl p-4 text-white">
              <p className="text-xs text-gray-200">Certificat obtenu</p>
              <p className="font-bold text-brand">Dev Fullstack</p>
              <p className="text-xs text-gray-300">Il y a 2 heures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
