'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { catalogueApi } from '@/lib/api/catalogue';
import { useT } from '@/hooks/use-t';

const FALLBACK_CATEGORIES = ['Développement', 'Santé', 'Agro', 'Business'];

export function HeroSection() {
  const t = useT();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [query, setQuery] = useState('');

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
    retry: false,
  });

  const categories = domains?.length ? domains.map((d) => ({ key: d.slug, label: d.name })) : FALLBACK_CATEGORIES.map((c) => ({ key: c, label: c }));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      videoRef.current?.pause();
    }
  }, []);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : '/courses');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background image + overlay */}
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/85 via-navy-800/80 to-navy-900/90" />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: text + search */}
          <div className="animate-fade-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              <Zap className="size-4" />
              {t('hero.badge')}
            </div>

            <h1 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              <span>{t('hero.title1')}</span>{' '}
              <span className="gradient-text">{t('hero.title2')}</span>{' '}
              <span className="text-brand">{t('hero.title3')}</span>
            </h1>

            <p className="mb-6 max-w-lg text-base text-gray-200 leading-relaxed">
              {t('hero.desc')}
            </p>

            {/* Search bar - primary CTA */}
            <form onSubmit={submitSearch} className="mb-4">
              <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('hero.search_placeholder')}
                    aria-label={t('hero.search_cta')}
                    className="h-11 border-0 pl-10 text-base text-gray-900 focus:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0">
                  {t('hero.search_cta')}
                </Button>
              </div>
            </form>

            {/* Quick category links */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c.key}
                  href={`/courses?domain=${encodeURIComponent(c.key)}`}
                  className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-white"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/register">
                <Button size="lg" variant="white" className="gap-2">
                  <Play className="size-5" />
                  {t('hero.cta_vr')}
                </Button>
              </Link>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  { value: '5 000+', label: t('hero.stat_users') },
                  { value: '12', label: t('hero.stat_courses') },
                  { value: '6', label: t('hero.stat_vr') },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-xl font-black text-white">{s.value}</span>
                    <span className="text-xs text-gray-300">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: visual */}
          <div id="vr-demo" className="relative hidden scroll-mt-24 lg:block">
            <div className="glass mx-auto max-w-sm overflow-hidden rounded-3xl">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                src="/videos/videoplayback.mp4"
                poster="/images/hero.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            {/* Floating card */}
            <div className="glass absolute -right-2 bottom-6 rounded-2xl p-4 text-white">
              <p className="text-xs text-gray-200">Simulation active</p>
              <p className="font-bold text-brand">Anatomie cardiaque</p>
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 motion-reduce:animate-none animate-pulse" />
                <span className="text-xs text-green-400">VR en cours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
