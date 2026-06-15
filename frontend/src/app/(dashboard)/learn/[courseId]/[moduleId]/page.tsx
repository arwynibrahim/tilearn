'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Play, FileText,
  Headphones, HelpCircle, BookOpen, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { catalogueApi } from '@/lib/api/catalogue';
import { learningApi } from '@/lib/api/learning';
import { cn } from '@/lib/utils';
import type { ModuleType } from '@/types';

const MODULE_ICON: Record<ModuleType, React.ElementType> = {
  VIDEO: Play,
  TEXT: FileText,
  VR: Headphones,
  QUIZ: HelpCircle,
};

interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  options?: string[];
  points?: number;
}

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export default function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const startedAt = useRef(new Date().toISOString());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number; passed: boolean; totalQuestions: number;
  } | null>(null);

  // Load modules list for navigation
  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => catalogueApi.modules.listByCourse(courseId),
  });

  // Load course for slug
  const { data: course } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      const { data } = await import('@/lib/api/client').then((m) =>
        m.default.get(`/courses/${courseId}`)
      );
      return data;
    },
    retry: false,
  });

  // Load progress
  const { data: progress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => learningApi.progress.getByCourse(courseId),
    retry: false,
  });

  const currentIdx = modules.findIndex((m) => m.id === moduleId);
  const currentModule = modules[currentIdx];
  const prevModule = currentIdx > 0 ? modules[currentIdx - 1] : null;
  const nextModule = currentIdx < modules.length - 1 ? modules[currentIdx + 1] : null;
  const moduleProgress = progress?.modules.find((m) => m.id === moduleId);
  const isCompleted = moduleProgress?.progress?.status === 'COMPLETED';

  // Mark complete mutation
  const markComplete = useMutation({
    mutationFn: () =>
      learningApi.progress.update(moduleId, { status: 'COMPLETED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress', courseId] });
      if (nextModule) {
        router.push(`/learn/${courseId}/${nextModule.id}`);
      }
    },
  });

  // Quiz submit mutation
  const submitQuiz = useMutation({
    mutationFn: (answers: { questionId: string; answer: unknown }[]) =>
      learningApi.quiz.submit({
        quizId: (currentModule as unknown as { quizId: string }).quizId ?? '',
        answers,
        startedAt: startedAt.current,
      }),
    onSuccess: (res) => {
      setQuizResult({ score: res.score, passed: res.passed, totalQuestions: res.totalQuestions });
      qc.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  // Auto-mark TEXT modules as started
  useEffect(() => {
    if (currentModule?.type === 'TEXT' && !moduleProgress?.progress?.status) {
      learningApi.progress.update(moduleId, { status: 'IN_PROGRESS' }).catch(() => null);
    }
  }, [moduleId, currentModule?.type, moduleProgress?.progress?.status]);

  if (!currentModule) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Chargement du module...
      </div>
    );
  }

  const Icon = MODULE_ICON[currentModule.type] ?? BookOpen;

  const renderContent = () => {
    switch (currentModule.type) {
      case 'VIDEO':
        return (
          <div className="overflow-hidden rounded-2xl bg-black aspect-video">
            {currentModule.contentUrl ? (
              <video
                key={moduleId}
                src={currentModule.contentUrl}
                controls
                className="w-full h-full"
                onEnded={() => markComplete.mutate()}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <Play className="mx-auto mb-3 size-12 opacity-30" />
                  <p>Vidéo non disponible</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div className="rounded-2xl border bg-white p-8">
            {currentModule.contentUrl ? (
              <iframe
                src={currentModule.contentUrl}
                className="w-full min-h-[500px] border-0 rounded-lg"
                title={currentModule.title}
              />
            ) : (
              <div className="prose max-w-none text-gray-700">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                  <FileText className="size-8 text-brand" />
                  <h2 className="text-xl font-bold text-gray-900">{currentModule.title}</h2>
                </div>
                <p className="text-gray-500 italic">Contenu textuel à venir.</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => markComplete.mutate()} loading={markComplete.isPending} className="gap-2">
                <CheckCircle2 className="size-4" />
                Marquer comme terminé
              </Button>
            </div>
          </div>
        );

      case 'VR':
        return (
          <div className="rounded-2xl border bg-navy/95 p-12 text-center">
            <Headphones className="mx-auto mb-4 size-16 text-brand" />
            <h3 className="mb-2 text-xl font-bold text-white">Contenu VR</h3>
            <p className="mb-6 text-gray-400">
              Ce module nécessite un casque VR (Meta Quest 2/3 ou Pico 4).
              <br />Lancez l&apos;application TIL sur votre casque pour accéder à cette simulation.
            </p>
            {currentModule.contentUrl && (
              <a href={currentModule.contentUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                  <Play className="size-4" />
                  Aperçu 360° (navigateur)
                </Button>
              </a>
            )}
            <div className="mt-6">
              <Button onClick={() => markComplete.mutate()} loading={markComplete.isPending} className="gap-2">
                <CheckCircle2 className="size-4" />
                J&apos;ai terminé la simulation
              </Button>
            </div>
          </div>
        );

      case 'QUIZ':
        return <QuizSection
          module={currentModule as unknown as { quizId?: string; title: string; id: string }}
          quizAnswers={quizAnswers}
          setQuizAnswers={setQuizAnswers}
          quizResult={quizResult}
          setQuizResult={setQuizResult}
          onSubmit={(answers) => submitQuiz.mutate(answers)}
          submitting={submitQuiz.isPending}
          onReset={() => { setQuizAnswers({}); setQuizResult(null); startedAt.current = new Date().toISOString(); }}
          onNext={nextModule ? () => router.push(`/learn/${courseId}/${nextModule.id}`) : undefined}
        />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Link
          href={course?.slug ? `/courses/${course.slug}` : '/courses'}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Retour au cours
        </Link>

        {progress && (
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-32 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${progress.stats.completionPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{progress.stats.completionPercent}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: module list */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r bg-white lg:block">
          <div className="p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Modules</p>
            <ul className="space-y-1">
              {modules.map((mod, idx) => {
                const MIcon = MODULE_ICON[mod.type] ?? BookOpen;
                const mp = progress?.modules.find((m) => m.id === mod.id);
                const done = mp?.progress?.status === 'COMPLETED';
                const active = mod.id === moduleId;
                return (
                  <li key={mod.id}>
                    <Link
                      href={`/learn/${courseId}/${mod.id}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                        active ? 'bg-brand/10 text-brand font-medium' : 'text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      ) : (
                        <MIcon className="size-4 shrink-0 text-gray-400" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        <span className="text-xs text-gray-400 mr-1">#{idx + 1}</span>
                        {mod.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6">
            {/* Module header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="size-5 text-brand" />
              </div>
              <div>
                <h1 className="font-black text-gray-900">{currentModule.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentModule.type}</Badge>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="size-3" /> Terminé
                    </span>
                  )}
                </div>
              </div>
            </div>

            {renderContent()}

            {/* Navigation */}
            {currentModule.type !== 'QUIZ' && (
              <div className="mt-6 flex items-center justify-between">
                {prevModule ? (
                  <Link href={`/learn/${courseId}/${prevModule.id}`}>
                    <Button variant="outline" className="gap-2">
                      <ChevronLeft className="size-4" /> Précédent
                    </Button>
                  </Link>
                ) : <div />}

                {nextModule && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      if (!isCompleted) markComplete.mutate();
                      else router.push(`/learn/${courseId}/${nextModule.id}`);
                    }}
                    loading={markComplete.isPending}
                  >
                    Suivant <ChevronRight className="size-4" />
                  </Button>
                )}

                {!nextModule && !isCompleted && (
                  <Button
                    className="gap-2"
                    onClick={() => markComplete.mutate()}
                    loading={markComplete.isPending}
                  >
                    <CheckCircle2 className="size-4" /> Terminer le cours
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz component ──────────────────────────────────────────────────────────

interface QuizSectionProps {
  module: { quizId?: string; title: string; id: string };
  quizAnswers: Record<string, string | string[]>;
  setQuizAnswers: (v: Record<string, string | string[]>) => void;
  quizResult: { score: number; passed: boolean; totalQuestions: number } | null;
  setQuizResult: (v: null) => void;
  onSubmit: (answers: { questionId: string; answer: unknown }[]) => void;
  submitting: boolean;
  onReset: () => void;
  onNext?: () => void;
}

function QuizSection({
  module, quizAnswers, setQuizAnswers, quizResult, onSubmit, submitting, onReset, onNext,
}: QuizSectionProps) {
  const [showAttempts, setShowAttempts] = useState(false);

  const { data: quiz, isLoading } = useQuery<QuizData>({
    queryKey: ['quiz', module.quizId ?? module.id],
    queryFn: async () => {
      const { default: apiClient } = await import('@/lib/api/client');
      const { data } = await apiClient.get(`/quiz/${module.quizId ?? module.id}`);
      return data;
    },
    enabled: !!(module.quizId ?? module.id),
    retry: false,
  });

  const { data: attempts = [], isLoading: loadingAttempts } = useQuery({
    queryKey: ['quiz-attempts', module.quizId ?? module.id],
    queryFn: async () => {
      const { default: apiClient } = await import('@/lib/api/client');
      const { data } = await apiClient.get(`/quiz/${module.quizId ?? module.id}/attempts`);
      return data;
    },
    enabled: showAttempts && !!(module.quizId ?? module.id),
    retry: false,
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400">Chargement du quiz...</div>;

  if (!quiz) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <HelpCircle className="mx-auto mb-3 size-12 text-gray-200" />
        <p className="text-gray-500">Quiz non disponible.</p>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <div className={cn(
          'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black',
          quizResult.passed ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500',
        )}>
          {Math.round(quizResult.score)}%
        </div>
        <h3 className="mb-2 text-xl font-black text-gray-900">
          {quizResult.passed ? '🎉 Félicitations !' : 'Continuez vos efforts'}
        </h3>
        <p className="mb-6 text-gray-500">
          {quizResult.passed
            ? 'Vous avez réussi ce quiz.'
            : `Score insuffisant. Il faut ${quiz.passingScore ?? 50}% pour valider.`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" /> Réessayer
          </Button>
          {quizResult.passed && onNext && (
            <Button onClick={onNext} className="gap-2">
              Module suivant <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: quizAnswers[q.id] ?? null,
    }));
    onSubmit(answers);
  };

  const answered = Object.keys(quizAnswers).filter((k) => quizAnswers[k] !== undefined && quizAnswers[k] !== '').length;

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{quiz.title}</h3>
        <span className="text-sm text-gray-400">{answered}/{quiz.questions.length} réponses</span>
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="border-t pt-5">
          <p className="mb-3 font-medium text-gray-800">
            <span className="mr-2 text-brand font-bold">{idx + 1}.</span>
            {q.text}
          </p>

          {q.options ? (
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all',
                    quizAnswers[q.id] === opt
                      ? 'border-brand bg-brand/5 text-brand font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700',
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={quizAnswers[q.id] === opt}
                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                    className="sr-only"
                  />
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    quizAnswers[q.id] === opt ? 'border-brand bg-brand' : 'border-gray-300',
                  )}>
                    {quizAnswers[q.id] === opt && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={(quizAnswers[q.id] as string) ?? ''}
              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
              placeholder="Votre réponse..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={answered < quiz.questions.length}
          className="gap-2"
        >
          <CheckCircle2 className="size-4" />
          Soumettre le quiz
        </Button>
      </div>

      {/* Quiz attempts history */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowAttempts(!showAttempts)}
          className="text-xs font-medium text-gray-500 hover:text-brand transition-colors"
        >
          {showAttempts ? 'Masquer' : 'Voir'} mes tentatives ({attempts.length})
        </button>
        {showAttempts && (
          <div className="mt-3 space-y-2">
            {loadingAttempts ? (
              <p className="text-xs text-gray-400">Chargement...</p>
            ) : attempts.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune tentative précédente.</p>
            ) : (
              attempts.map((a: { id: string; score: number; passed: boolean; submittedAt: string }) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <span className="text-gray-500">{new Date(a.submittedAt).toLocaleDateString('fr-FR')}</span>
                  <span className={`font-semibold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {Math.round(a.score)}% - {a.passed ? 'Réussi' : 'Échoué'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
