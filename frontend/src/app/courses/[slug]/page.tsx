'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, Users, BookOpen, Play, FileText, Headphones, HelpCircle,
  CheckCircle2, Lock, ChevronLeft, Star, Award,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseThumbnail } from '@/components/course-thumbnail';
import { catalogueApi } from '@/lib/api/catalogue';
import { learningApi } from '@/lib/api/learning';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/lib/api/client';
import type { CourseLevel, ModuleType } from '@/types';

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const MODULE_ICON: Record<ModuleType, React.ElementType> = {
  VIDEO: Play,
  TEXT: FileText,
  VR: Headphones,
  QUIZ: HelpCircle,
};

const MODULE_TYPE_LABEL: Record<ModuleType, string> = {
  VIDEO: 'Vidéo',
  TEXT: 'Lecture',
  VR: 'VR',
  QUIZ: 'Quiz',
};

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => catalogueApi.courses.get(slug),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', course?.id],
    queryFn: () => catalogueApi.modules.listByCourse(course!.id),
    enabled: !!course?.id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: learningApi.enrollments.list,
    enabled: isAuthenticated,
    retry: false,
  });

  const enrollment = enrollments.find((e) => e.courseId === course?.id);

  const enrollMut = useMutation({
    mutationFn: () => learningApi.enrollments.create(course!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      router.push(`/learn/${course!.id}/${modules[0]?.id ?? ''}`);
    },
    onError: (err) => setEnrollError(getApiErrorMessage(err, "Erreur lors de l'inscription.")),
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }
    setEnrollError(null);
    enrollMut.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <BookOpen className="mx-auto mb-4 size-16 text-gray-200" />
            <p className="text-gray-500">Cours introuvable.</p>
            <Link href="/courses"><Button variant="outline" className="mt-4">Retour au catalogue</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const totalDuration = modules.reduce((sum, m) => sum + (m.durationSeconds ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            Retour au catalogue
          </Link>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Info */}
            <div className="lg:col-span-2">
              {course.domain && (
                <p className="mb-2 text-sm font-medium text-brand">{course.domain.name}</p>
              )}
              <h1 className="mb-4 text-3xl font-black text-white lg:text-4xl">{course.title}</h1>
              {course.description && (
                <p className="mb-6 text-gray-400 leading-relaxed">{course.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <Badge variant="secondary">{LEVEL_LABELS[course.level]}</Badge>
                {course.duration != null && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {Math.round(course.duration / 60)}h de contenu
                  </span>
                )}
                {course._count?.enrollments != null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    {course._count.enrollments} apprenants
                  </span>
                )}
                {modules.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="size-4" />
                    {modules.length} modules
                  </span>
                )}
              </div>
            </div>

            {/* Enroll card */}
            <div>
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <CourseThumbnail
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-48"
                />
                <div className="p-6">
                  {course.price != null && (
                    <p className="mb-4 text-3xl font-black text-gray-900">
                      {course.price === 0 ? (
                        <span className="text-green-500">Gratuit</span>
                      ) : (
                        `${course.price.toLocaleString()} FCFA`
                      )}
                    </p>
                  )}

                  {enrollError && (
                    <p className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{enrollError}</p>
                  )}

                  {enrollment ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <CheckCircle2 className="size-4" />
                        Inscrit
                      </div>
                      <Link href={`/learn/${course.id}/${modules[0]?.id ?? ''}`}>
                        <Button className="w-full gap-2" size="lg" disabled={!modules[0]}>
                          <Play className="size-4" />
                          Continuer le cours
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleEnroll}
                      loading={enrollMut.isPending}
                    >
                      <Play className="size-4" />
                      {isAuthenticated ? "S'inscrire au cours" : 'Se connecter pour s\'inscrire'}
                    </Button>
                  )}

                  <ul className="mt-4 space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-400" />Accès à vie</li>
                    <li className="flex items-center gap-2"><Award className="size-4 text-brand" />Certificat de réussite</li>
                    <li className="flex items-center gap-2"><Star className="size-4 text-amber-400" />Contenu certifiant</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-black text-gray-900">Programme du cours</h2>

        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <BookOpen className="mx-auto mb-3 size-10 text-gray-200" />
            <p className="text-gray-400">Les modules seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {modules.map((mod, idx) => {
              const Icon = MODULE_ICON[mod.type] ?? BookOpen;
              const isAccessible = !!enrollment;
              const mins = mod.durationSeconds ? Math.ceil(mod.durationSeconds / 60) : null;

              return (
                <div
                  key={mod.id}
                  className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-all ${
                    isAccessible
                      ? 'cursor-pointer hover:border-brand/30 hover:shadow-sm'
                      : 'opacity-60'
                  }`}
                  onClick={() => {
                    if (isAccessible) router.push(`/learn/${course.id}/${mod.id}`);
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    {isAccessible ? <Icon className="size-5" /> : <Lock className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                      {mod.title}
                    </p>
                    <p className="text-xs text-gray-400">{MODULE_TYPE_LABEL[mod.type]}</p>
                  </div>
                  {mins != null && (
                    <span className="shrink-0 text-xs text-gray-400">{mins} min</span>
                  )}
                  {mod.isRequired && (
                    <Badge variant="secondary" className="shrink-0 text-xs">Requis</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {modules.length > 0 && totalDuration > 0 && (
          <p className="mt-4 text-sm text-gray-400">
            Durée totale estimée : {Math.round(totalDuration / 60)} minutes
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
