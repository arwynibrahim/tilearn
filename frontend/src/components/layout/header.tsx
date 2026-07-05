'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { useLangStore } from '@/stores/lang.store';
import { useT } from '@/hooks/use-t';
import { useLogout } from '@/hooks/use-auth';
import { Brand } from '@/components/layout/brand';
import { cn } from '@/lib/utils';
import { getDashboardHref } from '@/types';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const t = useT();
  const logout = useLogout();
  const router = useRouter();

  const navLinks = [
    { href: '/#courses', label: t('nav.courses') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/#faq', label: 'FAQ' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    router.push(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : '/courses');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Brand size={38} textClassName="hidden text-white sm:block" />

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('hero.search_placeholder')}
              aria-label={t('hero.search_cta')}
              className="h-9 border-white/20 bg-white/10 pl-9 text-sm text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
            />
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-sm font-medium text-gray-200 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-200 hover:text-white transition-colors"
            aria-label="Switch language"
          >
            <Globe className="size-3.5" />
            {lang.toUpperCase()}
          </button>

          {isAuthenticated ? (
            <>
              <Link href={getDashboardHref(user ?? null)}>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t('nav.register')}</Button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-md p-2 text-gray-200 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-white/10 bg-navy px-4 py-3 lg:hidden">
          <form onSubmit={submitSearch} className="mb-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('hero.search_placeholder')}
                aria-label={t('hero.search_cta')}
                className="h-10 border-white/20 bg-white/10 pl-9 text-sm text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-3" aria-label="Navigation mobile">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-200 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
