'use client';

import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Headphones, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseThumbnail } from '@/components/course-thumbnail';
import { catalogueApi } from '@/lib/api/catalogue';
import { useT } from '@/hooks/use-t';
import type { Course, CourseLevel } from '@/types';

const LEVEL_VARIANT: Record<CourseLevel, 'success' | 'warning' | 'destructive' | 'info'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'warning',
  ADVANCED: 'destructive',
  EXPERT: 'info',
};

// Marketing display shape - decoupled from the backend Course model so the
// landing keeps working with a static fallback when the API is unavailable.
interface LandingCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: CourseLevel;
  domainName: string;
  domainSlug: string;
  createdAt: string;
  thumbnail?: string | null;
  durationHours?: number;
  students?: number;
  price?: number | null;
  rating?: number;
  hasVR?: boolean;
}

const FALLBACK_COURSES: LandingCourse[] = [
  { id: '1', title: 'Développement Web Full-Stack', slug: 'dev-fullstack', description: 'Maîtrisez React, Node.js et les bases de données modernes.', level: 'INTERMEDIATE', domainName: 'Développement', domainSlug: 'dev', createdAt: '2026-05-01', durationHours: 48, students: 1240, price: 15000, rating: 4.8 },
  { id: '2', title: 'Anatomie & Cardiologie VR', slug: 'anatomie-vr', description: 'Explorez le corps humain en réalité virtuelle avec des simulations 3D.', level: 'ADVANCED', domainName: 'Santé', domainSlug: 'sante', createdAt: '2026-06-10', durationHours: 32, students: 890, price: 15000, rating: 4.9, hasVR: true },
  { id: '3', title: 'Agriculture Durable & Précision', slug: 'agro-precision', description: "Techniques modernes d'irrigation et de gestion des cultures.", level: 'BEGINNER', domainName: 'Agro', domainSlug: 'agro', createdAt: '2026-04-15', durationHours: 24, students: 560, price: 0, rating: 4.7, hasVR: true },
  { id: '4', title: 'DevOps & Cloud AWS', slug: 'devops-aws', description: 'CI/CD, Kubernetes, infrastructure as code sur AWS.', level: 'EXPERT', domainName: 'Développement', domainSlug: 'dev', createdAt: '2026-02-20', durationHours: 40, students: 780, price: 15000, rating: 4.6 },
  { id: '5', title: 'Soins Infirmiers VR', slug: 'soins-infirmiers-vr', description: 'Simulation de salle de soins avec retour haptique.', level: 'INTERMEDIATE', domainName: 'Santé', domainSlug: 'sante', createdAt: '2026-06-20', durationHours: 28, students: 430, price: 5000, rating: 4.8, hasVR: true },
  { id: '6', title: 'Cybersécurité & Ethical Hacking', slug: 'cybersec', description: "Tests d'intrusion, OWASP, gestion des vulnérabilités.", level: 'EXPERT', domainName: 'Développement', domainSlug: 'dev', createdAt: '2026-03-05', durationHours: 36, students: 650, price: 15000, rating: 4.5 },
  { id: '7', title: 'Gestion de Projet Agile', slug: 'gestion-projet-agile', description: 'Scrum, Kanban et pilotage de projets multi-équipes.', level: 'BEGINNER', domainName: 'Business', domainSlug: 'business', createdAt: '2026-06-25', durationHours: 18, students: 340, price: 5000, rating: 4.6 },
  { id: '8', title: 'Simulation Chirurgicale VR', slug: 'simulation-chirurgie-vr', description: 'Entraînement aux gestes chirurgicaux en environnement immersif.', level: 'EXPERT', domainName: 'Santé', domainSlug: 'sante', createdAt: '2026-01-12', durationHours: 30, students: 210, price: 15000, rating: 4.9, hasVR: true },
];

function toLanding(course: Course): LandingCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description ?? '',
    slug: course.slug,
    level: course.level,
    domainName: course.domain?.name ?? '',
    domainSlug: course.domain?.slug ?? '',
    createdAt: course.createdAt,
    thumbnail: course.thumbnail,
    durationHours: course.duration ? Math.round(course.duration / 60) : undefined,
    students: course._count?.enrollments,
    price: course.price,
    hasVR: course.modules?.some((m) => m.type === 'VR'),
  };
}

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'dev', label: 'Développement' },
  { key: 'sante', label: 'Santé' },
  { key: 'agro', label: 'Agro' },
  { key: 'business', label: 'Business' },
];

export function CoursesSection() {
  const t = useT();
  const [filter, setFilter] = useState('all');

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['courses-landing'],
    queryFn: () => catalogueApi.courses.list({ limit: 20 }),
    retry: false,
  });

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
    retry: false,
  });

  const filters = domains?.length
    ? [{ key: 'all', label: 'Tous' }, ...domains.map((d) => ({ key: d.slug, label: d.name }))]
    : FILTERS;

  const courses: LandingCourse[] = apiData?.data?.length ? apiData.data.map(toLanding) : FALLBACK_COURSES;
  const filtered = courses.filter((c) => filter === 'all' || c.domainSlug === filter);

  const popular = useMemo(
    () => [...filtered].sort((a, b) => (b.students ?? 0) - (a.students ?? 0)).slice(0, 8),
    [filtered]
  );
  const recent = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [filtered]
  );

  return (
    <section id="courses" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
            {t('courses.title')}
          </h2>
          <p className="text-lg text-gray-600">{t('courses.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-500">{t('courses.empty')}</p>
        ) : (
          <div className="space-y-12">
            <CourseRail title={t('courses.rail_popular')} courses={popular} t={t} />
            {recent.length > 0 && <CourseRail title={t('courses.rail_new')} courses={recent} t={t} />}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/courses">
            <Button variant="outline" size="lg" className="gap-2">
              {t('courses.view_all')}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CourseRail({ title, courses, t }: { title: string; courses: LandingCourse[]; t: (k: string) => string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Précédent"
            className="flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-brand/40 hover:text-brand"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Suivant"
            className="flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-brand/40 hover:text-brand"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto"
      >
        {courses.map((course) => (
          <div key={course.id} className="w-72 shrink-0 snap-start">
            <CourseCard course={course} t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="skeleton h-40 w-full rounded-none" />
      <CardContent className="p-5">
        <div className="skeleton mb-2 h-5 w-3/4" />
        <div className="skeleton mb-1.5 h-4 w-full" />
        <div className="skeleton mb-4 h-4 w-2/3" />
        <div className="skeleton h-9 w-full" />
      </CardContent>
    </Card>
  );
}

function CourseCard({ course, t }: { course: LandingCourse; t: (k: string) => string }) {
  return (
    <Card className="card-hover group h-full overflow-hidden">
      <div className="relative h-40">
        <CourseThumbnail src={course.thumbnail} alt={course.title} className="h-40" />
        {course.hasVR && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
            <Headphones className="size-3" />
            VR
          </div>
        )}
        <Badge variant={LEVEL_VARIANT[course.level]} className="absolute bottom-3 left-3">
          {t(`courses.level_${course.level.toLowerCase()}`)}
        </Badge>
        {course.price != null && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-gray-800">
            {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} FCFA`}
          </span>
        )}
      </div>

      <CardContent className="p-5">
        {course.domainName && (
          <p className="mb-1 text-xs font-semibold text-brand">{course.domainName}</p>
        )}
        <h3 className="mb-2 font-bold text-gray-900 line-clamp-2 group-hover:text-brand transition-colors">
          {course.title}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{course.description}</p>

        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
          {course.durationHours != null && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {course.durationHours}h
            </span>
          )}
          {course.students != null && (
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {course.students.toLocaleString()} {t('courses.students')}
            </span>
          )}
          {course.rating != null && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="size-3 fill-current" />
              {course.rating}
            </span>
          )}
        </div>

        <Link href={`/courses/${course.slug}`} className="block">
          <Button className="w-full" size="sm">
            {t('courses.enroll')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
