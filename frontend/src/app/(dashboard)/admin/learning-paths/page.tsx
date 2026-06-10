'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Route, Plus, Building2, BookOpen, X, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { b2bApi } from '@/lib/api/b2b';
import { catalogueApi } from '@/lib/api/catalogue';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { LearningPath, Course } from '@/types';

const createSchema = z.object({
  organizationId: z.string().min(1, 'Requis'),
  title: z.string().min(1, 'Requis'),
  description: z.string().optional(),
  courseIds: z.array(z.string()).min(1, 'Sélectionnez au moins un cours'),
});
type CreateForm = z.infer<typeof createSchema>;

function CreatePathModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const { data: orgs = [] } = useQuery({ queryKey: ['admin-orgs'], queryFn: b2bApi.organizations.list, retry: false });
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-all'],
    queryFn: () => catalogueApi.courses.list({ limit: 100 }),
    retry: false,
  });
  const allCourses = coursesData?.data ?? [];

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { organizationId: orgId, title: '', description: '', courseIds: [] },
  });

  const createMut = useMutation({
    mutationFn: (data: CreateForm) => b2bApi.learningPaths.create({
      organizationId: data.organizationId,
      title: data.title,
      description: data.description,
      courses: data.courseIds.map((courseId) => ({ courseId })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-learning-paths'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la création.')),
  });

  const toggleCourse = (courseId: string) => {
    const next = selectedCourseIds.includes(courseId)
      ? selectedCourseIds.filter((id) => id !== courseId)
      : [...selectedCourseIds, courseId];
    setSelectedCourseIds(next);
    setValue('courseIds', next, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Créer un parcours</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit((d) => { setError(null); createMut.mutate(d); })} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-1.5">
            <Label>Organisation</Label>
            <select
              {...register('organizationId')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Nom du parcours</Label>
            <Input id="title" placeholder="Ex: Formation VR Complète" {...register('title')} className={errors.title ? 'border-red-400' : ''} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optionnel)</Label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cours à inclure</Label>
            {allCourses.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun cours disponible.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-gray-100 p-2">
                {allCourses.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer transition-all ${
                      selectedCourseIds.includes(c.id)
                        ? 'bg-brand/5 border border-brand/20'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.domain?.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.courseIds && <p className="text-xs text-red-500">{errors.courseIds.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={createMut.isPending}>Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LearningPathsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: orgs = [] } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  const orgId = selectedOrgId ?? orgs[0]?.id;

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ['admin-learning-paths', orgId],
    queryFn: () => b2bApi.learningPaths.listByOrg(orgId!),
    enabled: !!orgId,
    retry: false,
  });

  return (
    <div className="space-y-6">
      {showCreate && orgId && <CreatePathModal orgId={orgId} onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Parcours d&apos;apprentissage</h1>
          <p className="text-sm text-gray-500">Créez et gérez des parcours personnalisés par organisation</p>
        </div>
        {orgId && (
          <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Créer un parcours
          </Button>
        )}
      </div>

      {orgs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                orgId === org.id
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="size-3.5" />
              {org.name}
              {org._count?.learningPaths != null && (
                <span className="text-xs opacity-70">({org._count.learningPaths})</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">Aucune organisation. Créez-en une pour gérer les parcours.</p>
          </CardContent>
        </Card>
      )}

      {orgId && (isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : paths.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Route className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="mb-4 text-gray-400">Aucun parcours pour cette organisation.</p>
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" /> Créer le premier parcours
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <Card key={path.id} className="card-hover">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                    <Route className="size-5 text-brand" />
                  </div>
                  <Badge variant="secondary">{path.courses?.length ?? 0} cours</Badge>
                </div>
                <h3 className="font-bold text-gray-900">{path.title}</h3>
                {path.description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{path.description}</p>}

                {path.courses && path.courses.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {path.courses.slice(0, 3).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                          {i + 1}
                        </span>
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                    {path.courses.length > 3 && (
                      <p className="text-xs text-gray-400 pl-7">+{path.courses.length - 3} autres...</p>
                    )}
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-400">Créé le {formatDate(path.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
