'use client';

import { useQuery } from '@tanstack/react-query';
import { Glasses, Play, Box, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { learningApi } from '@/lib/api/learning';
import { catalogueApi } from '@/lib/api/catalogue';
import { vrApi } from '@/lib/api/vr';
import { formatDate } from '@/lib/utils';
import type { Enrollment } from '@/types';

function VrScenePreview({ moduleId }: { moduleId: string }) {
  const { data: scene, isLoading } = useQuery({
    queryKey: ['vr-scene', moduleId],
    queryFn: () => vrApi.scenes.getByModule(moduleId),
    retry: false,
  });

  if (isLoading) return <div className="text-xs text-gray-400">Chargement...</div>;
  if (!scene) return <div className="text-xs text-gray-400">Aucune scène VR</div>;

  return (
    <div className="rounded-lg bg-navy/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Box className="size-4 text-navy" />
        <span className="text-xs font-semibold text-navy">Scène VR disponible</span>
      </div>
      <p className="text-xs text-gray-500">
        {scene.fallbackContentUrl ? 'Contenu de fallback disponible' : 'Données de scène chargées'}
      </p>
      {scene.sceneData && typeof scene.sceneData === 'object' && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.keys(scene.sceneData).slice(0, 5).map((key) => (
            <Badge key={key} variant="outline" className="text-[10px]">{key}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function VrEnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', enrollment.courseId],
    queryFn: () => catalogueApi.modules.listByCourse(enrollment.courseId),
    retry: false,
  });

  const firstVrModule = modules.find((m) => m.type === 'VR') ?? modules[0];

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
            <Glasses className="size-5 text-navy" />
          </div>
          <Badge variant="info">VR</Badge>
        </div>
        <CardTitle className="text-base mt-2">{enrollment.course?.title ?? 'Cours'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <VrScenePreview moduleId={enrollment.courseId} />
        {firstVrModule && (
          <Link href={`/learn/${enrollment.courseId}/${firstVrModule.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Play className="size-3.5" />
              Lancer l&apos;expérience
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function VrDashboard() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    retry: false,
  });

  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Réalité Virtuelle</h1>
        <p className="text-sm text-gray-500">Accédez à vos expériences VR depuis vos cours</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : activeEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Glasses className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="mb-4 text-gray-400">
              Inscrivez-vous à un cours contenant des modules VR pour commencer.
            </p>
            <Link href="/courses">
              <Button className="gap-2">
                Explorer les cours <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeEnrollments.map((e) => (
            <VrEnrollmentCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  );
}
