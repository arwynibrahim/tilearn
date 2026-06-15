'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Clock, Users, ChevronLeft, ChevronRight, BookOpen,
  Play, CheckCircle2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourseThumbnail } from '@/components/course-thumbnail';
import { catalogueApi } from '@/lib/api/catalogue';
import { learningApi } from '@/lib/api/learning';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/lib/api/client';
import type { CourseLevel, Course } from '@/types';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance',
  EXPERT: 'Expert',
};

const LEVEL_VARIANT: Record<CourseLevel, 'success' | 'info' | 'warning' | 'destructive'> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'info',
  ADVANCED: 'warning',
  EXPERT: 'destructive',
};

const LIMIT = 12;

function CourseCard({
  course,
  isEnrolled,
  canEnroll,
  onEnroll,
  isEnrolling,
  enrollError,
}: {
  course: Course;
  isEnrolled: boolean;
  canEnroll: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
  enrollError: string | null;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative">
        <Link href={`/courses/${course.slug}`}>
          <CourseThumbnail src={course.thumbnail} alt={course.title} className="h-40" />
        </Link>
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge variant={LEVEL_VARIANT[course.level]} className="text-[10px]">
            {LEVEL_LABELS[course.level]}
          </Badge>
        </div>
        {course.price != null && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm">
              {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} FCFA`}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {course.domain && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
            {course.domain.name}
          </p>
        )}
        <Link href={`/courses/${course.slug}`}>
          <h3 className="mb-1.5 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-brand transition-colors">
            {course.title}
          </h3>
        </Link>
        {course.description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">{course.description}</p>
        )}

        <div className="mt-auto flex items-center gap-3 text-[10px] text-gray-400">
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
              <BookOpen className="size-3" />
              {course._count.modules}
            </span>
          )}
        </div>

        {canEnroll && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            {isEnrolled ? (
              <Link href={`/courses/${course.slug}`}>
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Play className="size-3" />
                  Continuer
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={onEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3" />
                    S&apos;inscrire
                  </>
                )}
              </Button>
            )}
            {enrollError && (
              <p className="mt-1.5 text-[10px] text-red-500">{enrollError}</p>
            )}
          </div>
        )}

        {!canEnroll && isEnrolled && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-600">
              <CheckCircle2 className="size-3" />
              Inscrit
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function DashboardCataloguePage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domainId, setDomainId] = useState('');
  const [level, setLevel] = useState('');

  const canEnroll = user?.role === 'LEARNER';

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-courses', page, domainId, level],
    queryFn: () => catalogueApi.courses.list({
      page,
      limit: LIMIT,
      domainId: domainId || undefined,
      level: level || undefined,
    }),
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    enabled: canEnroll,
    retry: false,
  });

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  const enrollMut = useMutation({
    mutationFn: (courseId: string) => learningApi.enrollments.create(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900">Catalogue</h1>
        <p className="text-sm text-gray-500">
          Explorez nos formations certifiantes et inscrivez-vous
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setDomainId('');
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                !domainId
                  ? 'bg-brand text-white shadow-sm shadow-brand/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDomainId(d.id);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  domainId === d.id
                    ? 'bg-brand text-white shadow-sm shadow-brand/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">Tous niveaux</option>
              {(Object.keys(LEVEL_LABELS) as CourseLevel[]).map((l) => (
                <option key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white h-72 border border-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <BookOpen className="mx-auto mb-4 size-16 text-gray-200" />
          <p className="text-sm text-gray-400">Aucun cours trouve.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled}
                canEnroll={canEnroll}
                onEnroll={() => enrollMut.mutate(course.id)}
                isEnrolling={enrollMut.isPending && enrollMut.variables === course.id}
                enrollError={
                  enrollMut.isError && enrollMut.variables === course.id
                    ? getApiErrorMessage(enrollMut.error, "Erreur d'inscription")
                    : null
                }
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="gap-2"
          >
            <ChevronLeft className="size-4" /> Precedent
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
  );
}
