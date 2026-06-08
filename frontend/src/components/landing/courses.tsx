'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Star, Clock, Users, Headphones, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { catalogueApi } from '@/lib/api/catalogue';
import { useT } from '@/hooks/use-t';
import type { Course, CourseLevel } from '@/types';

const LEVEL_VARIANT: Record<CourseLevel, 'success' | 'warning' | 'destructive' | 'info'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'warning',
  ADVANCED: 'destructive',
  EXPERT: 'info',
};

// Marketing display shape — decoupled from the backend Course model so the
// landing keeps working with a static fallback when the API is unavailable.
interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  level: CourseLevel;
  domainSlug: string;
  durationHours?: number;
  students?: number;
  rating?: number;
  hasVR?: boolean;
}

const FALLBACK_COURSES: DisplayCourse[] = [
  { id: '1', title: 'Développement Web Full-Stack', slug: 'dev-fullstack', description: 'Maîtrisez React, Node.js et les bases de données modernes.', level: 'INTERMEDIATE', domainSlug: 'dev', durationHours: 48, students: 1240, rating: 4.8 },
  { id: '2', title: 'Anatomie & Cardiologie VR', slug: 'anatomie-vr', description: 'Explorez le corps humain en réalité virtuelle avec des simulations 3D.', level: 'ADVANCED', domainSlug: 'sante', durationHours: 32, students: 890, rating: 4.9, hasVR: true },
  { id: '3', title: 'Agriculture Durable & Précision', slug: 'agro-precision', description: "Techniques modernes d'irrigation et de gestion des cultures.", level: 'BEGINNER', domainSlug: 'agro', durationHours: 24, students: 560, rating: 4.7, hasVR: true },
  { id: '4', title: 'DevOps & Cloud AWS', slug: 'devops-aws', description: 'CI/CD, Kubernetes, infrastructure as code sur AWS.', level: 'EXPERT', domainSlug: 'dev', durationHours: 40, students: 780, rating: 4.6 },
  { id: '5', title: 'Soins Infirmiers VR', slug: 'soins-infirmiers-vr', description: 'Simulation de salle de soins avec retour haptique.', level: 'INTERMEDIATE', domainSlug: 'sante', durationHours: 28, students: 430, rating: 4.8, hasVR: true },
  { id: '6', title: 'Cybersécurité & Ethical Hacking', slug: 'cybersec', description: "Tests d'intrusion, OWASP, gestion des vulnérabilités.", level: 'EXPERT', domainSlug: 'dev', durationHours: 36, students: 650, rating: 4.5 },
];

function toDisplay(course: Course): DisplayCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description ?? '',
    slug: course.slug,
    level: course.level,
    domainSlug: course.domain?.slug ?? '',
    durationHours: course.duration ? Math.round(course.duration / 60) : undefined,
    students: course._count?.enrollments,
    hasVR: course.modules?.some((m) => m.type === 'VR'),
  };
}

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'dev', label: 'Développement' },
  { key: 'sante', label: 'Santé' },
  { key: 'agro', label: 'Agro' },
];

export function CoursesSection() {
  const t = useT();
  const [filter, setFilter] = useState('all');

  const { data: apiData } = useQuery({
    queryKey: ['courses-landing'],
    queryFn: () => catalogueApi.courses.list({ limit: 6 }),
    retry: false,
  });

  const courses: DisplayCourse[] = apiData?.data?.length
    ? apiData.data.map(toDisplay)
    : FALLBACK_COURSES;

  const filtered = courses.filter((c) => filter === 'all' || c.domainSlug === filter);

  return (
    <section id="courses" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
            {t('courses.title')}
          </h2>
          <p className="text-lg text-gray-500">{t('courses.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-400">{t('courses.empty')}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} t={t} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/register">
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

function CourseCard({ course, t }: { course: DisplayCourse; t: (k: string) => string }) {
  return (
    <Card className="card-hover group overflow-hidden">
      <div className="relative h-40 bg-gradient-to-br from-navy to-navy-700 overflow-hidden">
        <div className="absolute inset-0 bg-brand/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="size-12 rounded-xl bg-brand/30 flex items-center justify-center">
              <span className="text-2xl font-black text-white">{course.title[0]}</span>
            </div>
          </div>
        </div>
        {course.hasVR && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">
            <Headphones className="size-3" />
            VR
          </div>
        )}
        <Badge variant={LEVEL_VARIANT[course.level]} className="absolute bottom-3 left-3">
          {t(`courses.level_${course.level.toLowerCase()}`)}
        </Badge>
      </div>

      <CardContent className="p-5">
        <h3 className="mb-2 font-bold text-gray-900 line-clamp-2 group-hover:text-brand transition-colors">
          {course.title}
        </h3>
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">{course.description}</p>

        <div className="mb-4 flex items-center gap-4 text-xs text-gray-400">
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

        <Link href={`/register?course=${course.slug}`} className="block">
          <Button className="w-full" size="sm">
            {t('courses.enroll')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
