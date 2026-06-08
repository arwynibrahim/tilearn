'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, Users, ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { catalogueApi } from '@/lib/api/catalogue';
import type { CourseLevel } from '@/types';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};
const LEVEL_VARIANT: Record<CourseLevel, 'success' | 'info' | 'warning' | 'destructive'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'info',
  ADVANCED: 'warning',
  EXPERT: 'destructive',
};

const LIMIT = 12;

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domainId, setDomainId] = useState<string>('');
  const [level, setLevel] = useState<string>('');

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, domainId, level],
    queryFn: () => catalogueApi.courses.list({ page, limit: LIMIT, domainId: domainId || undefined, level: level || undefined }),
    retry: false,
  });

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mb-3 text-4xl font-black text-white">
              Catalogue de <span className="text-brand">cours</span>
            </h1>
            <p className="mb-8 text-gray-400">
              Des formations certifiantes dans les domaines en forte demande
            </p>
            <div className="relative mx-auto max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setDomainId(''); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  !domainId ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tous les domaines
              </button>
              {domains.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDomainId(d.id); setPage(1); }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    domainId === d.id ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Tous niveaux</option>
                {(Object.keys(LEVEL_LABELS) as CourseLevel[]).map((l) => (
                  <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white h-72" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 size-16 text-gray-200" />
              <p className="text-gray-400">Aucun cours trouvé.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <article className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-gradient-to-br from-navy to-brand/80 overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="size-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant={LEVEL_VARIANT[course.level]}>{LEVEL_LABELS[course.level]}</Badge>
                      </div>
                      {course.price != null && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-800">
                            {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} FCFA`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {course.domain && (
                        <p className="mb-1 text-xs font-medium text-brand">{course.domain.name}</p>
                      )}
                      <h3 className="mb-2 line-clamp-2 font-bold text-gray-900 group-hover:text-brand transition-colors">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="mb-3 line-clamp-2 text-xs text-gray-500">{course.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {course.duration != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {Math.round(course.duration / 60)}h
                          </span>
                        )}
                        {course._count?.enrollments != null && (
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {course._count.enrollments}
                          </span>
                        )}
                        {course._count?.modules != null && (
                          <span className="flex items-center gap-1">
                            <Star className="size-3" />
                            {course._count.modules} modules
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="gap-2"
              >
                <ChevronLeft className="size-4" /> Précédent
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="gap-2"
              >
                Suivant <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
