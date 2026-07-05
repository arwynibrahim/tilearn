'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, BadgeCheck, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { learningApi } from '@/lib/api/learning';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import { PageHeader, StatsCard, SectionCard, StatusBadge } from '@/components/dashboard';

export default function LearnerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    retry: false,
  });

  const { data: certificates = [], isLoading: certLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: learningApi.certificates.list,
    retry: false,
  });

  const active = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour ${user?.prenom ?? ''}`}
        description="Voici un aperçu de votre apprentissage"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard icon={BookOpen} label="Cours en cours" value={enrollLoading ? '...' : active} colorClass="bg-stat-brand" />
        <StatsCard icon={GraduationCap} label="Cours terminés" value={enrollLoading ? '...' : completed} colorClass="bg-stat-green" />
        <StatsCard icon={BadgeCheck} label="Certificats" value={certLoading ? '...' : certificates.length} colorClass="bg-stat-blue" />
      </div>

      <SectionCard
        icon={BookOpen}
        title="Mes cours"
        action={
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm" className="gap-1 text-brand">
              Tout voir <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        }
      >
        {enrollLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton size-9 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-3.5 w-2/5" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gray-50">
              <Sparkles className="size-8 text-gray-300" />
            </div>
            <p className="mb-1 text-base font-semibold text-gray-900">Aucun cours pour l&apos;instant</p>
            <p className="mb-6 text-sm text-gray-400">Explorez le catalogue et commencez votre apprentissage.</p>
            <Link href="/dashboard/catalogue">
              <Button className="gap-2">
                Explorer le catalogue <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {enrollments.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                    {e.course?.title?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{e.course?.title ?? 'Cours'}</p>
                    <p className="text-xs text-gray-400">Inscrit le {formatDate(e.enrolledAt)}</p>
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
