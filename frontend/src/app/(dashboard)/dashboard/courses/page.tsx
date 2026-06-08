'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { learningApi } from '@/lib/api/learning';
import { formatDate } from '@/lib/utils';
import type { Enrollment, EnrollmentStatus } from '@/types';

const STATUS_VARIANT: Record<EnrollmentStatus, 'success' | 'info' | 'warning' | 'destructive'> = {
  ACTIVE: 'info',
  COMPLETED: 'success',
  EXPIRED: 'warning',
  DROPPED: 'destructive',
};
const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: 'En cours',
  COMPLETED: 'Terminé',
  EXPIRED: 'Expiré',
  DROPPED: 'Abandonné',
};

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  // Per-course progress (modules completed)
  const { data: progress } = useQuery({
    queryKey: ['progress', enrollment.courseId],
    queryFn: () => learningApi.progress.getByCourse(enrollment.courseId),
    retry: false,
  });

  const percent = progress?.stats.completionPercent ?? 0;

  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-lg font-black text-brand">
            {enrollment.course?.title?.[0] ?? '?'}
          </div>
          <Badge variant={STATUS_VARIANT[enrollment.status]}>{STATUS_LABELS[enrollment.status]}</Badge>
        </div>

        <h3 className="mb-1 font-bold text-gray-900">{enrollment.course?.title ?? 'Cours'}</h3>
        <p className="mb-4 flex items-center gap-1 text-xs text-gray-400">
          <Clock className="size-3" />
          Inscrit le {formatDate(enrollment.enrolledAt)}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">Progression</span>
            <span className="font-semibold text-gray-900">{percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          {progress && (
            <p className="mt-1 text-xs text-gray-400">
              {progress.stats.completedModules} / {progress.stats.totalModules} modules
            </p>
          )}
        </div>

        {enrollment.course?.slug && (
          <Link href={`/#courses`} className="block">
            <Button variant="outline" size="sm" className="w-full gap-2">
              Continuer <ArrowRight className="size-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyCoursesPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mes cours</h1>
        <p className="text-sm text-gray-500">{enrollments.length} inscription(s)</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="mb-4 text-gray-400">Vous n&apos;êtes inscrit à aucun cours.</p>
            <Link href="/#courses">
              <Button className="gap-2">
                Explorer le catalogue <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <EnrollmentCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  );
}
