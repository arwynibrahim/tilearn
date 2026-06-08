'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, BadgeCheck, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { learningApi } from '@/lib/api/learning';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import type { EnrollmentStatus } from '@/types';

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

export default function LearnerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    retry: false,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: learningApi.certificates.list,
    retry: false,
  });

  const active = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          Bonjour {user?.prenom} 👋
        </h1>
        <p className="text-sm text-gray-500">Voici un aperçu de votre apprentissage</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: 'Cours en cours', value: active, color: 'bg-brand' },
          { icon: GraduationCap, label: 'Cours terminés', value: completed, color: 'bg-green-500' },
          { icon: BadgeCheck, label: 'Certificats', value: certificates.length, color: 'bg-blue-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-2xl p-3 ${s.color}`}>
                <s.icon className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My courses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-brand" />
            Mes cours
          </CardTitle>
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="sm" className="gap-1 text-brand">
              Tout voir <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="py-10 text-center">
              <Sparkles className="mx-auto mb-3 size-10 text-gray-200" />
              <p className="mb-4 text-sm text-gray-400">
                Vous n&apos;êtes inscrit à aucun cours pour l&apos;instant.
              </p>
              <Link href="/#courses">
                <Button className="gap-2">
                  Explorer le catalogue <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {enrollments.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                      {e.course?.title?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.course?.title ?? 'Cours'}</p>
                      <p className="text-xs text-gray-400">Inscrit le {formatDate(e.enrolledAt)}</p>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABELS[e.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
