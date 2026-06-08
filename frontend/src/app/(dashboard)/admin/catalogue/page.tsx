'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Library, BookOpen, Trash2, Eye, EyeOff, Layers,
  Pencil, X, Save, Play, FileText, Headphones, HelpCircle, GripVertical,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { catalogueApi } from '@/lib/api/catalogue';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Course, CourseLevel, Module, ModuleType } from '@/types';

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};
const MODULE_TYPES: ModuleType[] = ['VIDEO', 'TEXT', 'QUIZ', 'VR'];
const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  VIDEO: 'Vidéo',
  TEXT: 'Lecture',
  QUIZ: 'Quiz',
  VR: 'Réalité virtuelle',
};
const MODULE_TYPE_ICON: Record<ModuleType, React.ElementType> = {
  VIDEO: Play,
  TEXT: FileText,
  QUIZ: HelpCircle,
  VR: Headphones,
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

const domainSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  slug: z.string().min(2, 'Slug requis').regex(/^[a-z0-9-]+$/, 'minuscules, chiffres, tirets'),
  description: z.string().optional(),
});
type DomainForm = z.infer<typeof domainSchema>;

const courseSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  domainId: z.string().min(1, 'Domaine requis'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  duration: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url('URL invalide').optional().or(z.literal('')),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
});
type CourseForm = z.infer<typeof courseSchema>;

const moduleSchema = z.object({
  title: z.string().min(2, 'Titre requis'),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'VR']),
  contentUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  durationSeconds: z.coerce.number().int().positive().optional(),
  isRequired: z.boolean().default(true),
});
type ModuleForm = z.infer<typeof moduleSchema>;

// ─── Module management drawer ─────────────────────────────────────────────────

function ModulesDrawer({ course, onClose }: { course: Course; onClose: () => void }) {
  const qc = useQueryClient();
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['course-modules', course.id],
    queryFn: () => catalogueApi.modules.listByCourse(course.id),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { type: 'VIDEO', isRequired: true },
  });

  const editForm = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
  });

  const addModule = useMutation({
    mutationFn: (data: ModuleForm) =>
      catalogueApi.modules.create({
        ...data,
        courseId: course.id,
        order: modules.length + 1,
        contentUrl: data.contentUrl || undefined,
        durationSeconds: data.durationSeconds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-modules', course.id] });
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
      reset({ type: 'VIDEO', isRequired: true });
      setShowAddForm(false);
      setFormError(null);
    },
    onError: (err) => setFormError(getApiErrorMessage(err, "Erreur lors de l'ajout.")),
  });

  const updateModule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ModuleForm> }) =>
      catalogueApi.modules.update(id, {
        ...data,
        contentUrl: data.contentUrl || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-modules', course.id] });
      setEditingModule(null);
    },
    onError: (err) => setFormError(getApiErrorMessage(err, 'Erreur lors de la modification.')),
  });

  const startEdit = (mod: Module) => {
    setEditingModule(mod);
    setShowAddForm(false);
    editForm.reset({
      title: mod.title,
      type: mod.type,
      contentUrl: mod.contentUrl ?? '',
      durationSeconds: mod.durationSeconds ?? undefined,
      isRequired: mod.isRequired,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Modules du cours</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{course.title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{formError}</div>
          )}

          {/* Module list */}
          {isLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">Chargement...</div>
          ) : modules.length === 0 && !showAddForm ? (
            <div className="py-10 text-center">
              <BookOpen className="mx-auto mb-3 size-10 text-gray-200" />
              <p className="mb-4 text-sm text-gray-400">Aucun module pour ce cours.</p>
            </div>
          ) : (
            <ul className="mb-4 space-y-2">
              {modules.map((mod, idx) => {
                const Icon = MODULE_TYPE_ICON[mod.type];
                return (
                  <li key={mod.id} className="rounded-xl border bg-white">
                    {editingModule?.id === mod.id ? (
                      <form
                        onSubmit={editForm.handleSubmit((d) => {
                          setFormError(null);
                          updateModule.mutate({ id: mod.id, data: d });
                        })}
                        className="p-4 space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <Label>Titre</Label>
                            <Input {...editForm.register('title')} />
                          </div>
                          <div className="space-y-1">
                            <Label>Type</Label>
                            <select
                              {...editForm.register('type')}
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            >
                              {MODULE_TYPES.map((t) => (
                                <option key={t} value={t}>{MODULE_TYPE_LABELS[t]}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label>Durée (secondes)</Label>
                            <Input type="number" {...editForm.register('durationSeconds')} placeholder="600" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label>URL du contenu</Label>
                            <Input type="url" {...editForm.register('contentUrl')} placeholder="https://..." />
                          </div>
                          <label className="col-span-2 flex items-center gap-2 text-sm">
                            <input type="checkbox" {...editForm.register('isRequired')} />
                            Module requis
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" loading={updateModule.isPending} className="gap-1">
                            <Save className="size-3.5" /> Enregistrer
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditingModule(null)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3 p-3">
                        <GripVertical className="size-4 shrink-0 text-gray-300" />
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                          <Icon className="size-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            <span className="text-xs text-gray-400 mr-1">#{idx + 1}</span>
                            {mod.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {MODULE_TYPE_LABELS[mod.type]}
                            {mod.durationSeconds ? ` · ${Math.ceil(mod.durationSeconds / 60)} min` : ''}
                            {mod.isRequired ? ' · Requis' : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => startEdit(mod)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Add form */}
          {showAddForm && (
            <form
              onSubmit={handleSubmit((d) => { setFormError(null); addModule.mutate(d); })}
              className="rounded-xl border border-dashed border-brand/30 bg-brand/5 p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-brand">Nouveau module</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Titre</Label>
                  <Input placeholder="Introduction" {...register('title')} className={errors.title ? 'border-red-400' : ''} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select
                    {...register('type')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {MODULE_TYPES.map((t) => (
                      <option key={t} value={t}>{MODULE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Durée (secondes)</Label>
                  <Input type="number" placeholder="600" {...register('durationSeconds')} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>URL du contenu (optionnel)</Label>
                  <Input type="url" placeholder="https://..." {...register('contentUrl')} />
                  {errors.contentUrl && <p className="text-xs text-red-500">{errors.contentUrl.message}</p>}
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isRequired')} />
                  Module requis pour la complétion
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={addModule.isPending}>Ajouter</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
              </div>
            </form>
          )}
        </div>

        <div className="border-t p-4">
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => { setShowAddForm(true); setEditingModule(null); }}
            disabled={showAddForm}
          >
            <Plus className="size-4" />
            Ajouter un module
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit course modal ─────────────────────────────────────────────────────────

function EditCourseModal({ course, domains, onClose }: {
  course: Course;
  domains: { id: string; name: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title,
      domainId: course.domainId,
      level: course.level,
      duration: course.duration ?? undefined,
      price: course.price ?? undefined,
      description: course.description ?? '',
      thumbnail: course.thumbnail ?? '',
      language: course.language ?? 'fr',
      isPublished: course.isPublished,
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<CourseForm>) =>
      catalogueApi.courses.update(course.id, {
        ...data,
        thumbnail: data.thumbnail || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
      qc.invalidateQueries({ queryKey: ['course', course.slug] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la modification.')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Modifier le cours</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => { setError(null); updateMut.mutate(d); })}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input {...register('title')} className={errors.title ? 'border-red-400' : ''} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Domaine</Label>
              <select
                {...register('domainId')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Niveau</Label>
              <select
                {...register('level')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Durée (min)</Label>
              <Input type="number" placeholder="120" {...register('duration')} />
            </div>
            <div className="space-y-1.5">
              <Label>Prix (FCFA)</Label>
              <Input type="number" placeholder="0" {...register('price')} />
            </div>
            <div className="space-y-1.5">
              <Label>Langue</Label>
              <select
                {...register('language')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
              placeholder="Décrivez le contenu du cours..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>URL de la miniature</Label>
            <Input type="url" placeholder="https://..." {...register('thumbnail')} />
            {errors.thumbnail && <p className="text-xs text-red-500">{errors.thumbnail.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isPublished')} />
            Cours publié (visible dans le catalogue)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={updateMut.isPending} className="gap-2">
              <Save className="size-4" />
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CataloguePage() {
  const qc = useQueryClient();
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
    retry: false,
  });

  const { data: coursesPage, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => catalogueApi.courses.list({ limit: 100 }),
    retry: false,
  });
  const courses = coursesPage?.data ?? [];

  const domainForm = useForm<DomainForm>({ resolver: zodResolver(domainSchema) });
  const createDomain = useMutation({
    mutationFn: catalogueApi.domains.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      setShowDomainForm(false);
      domainForm.reset();
    },
  });

  const courseForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { level: 'BEGINNER', language: 'fr' },
  });
  const createCourse = useMutation({
    mutationFn: catalogueApi.courses.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
      setShowCourseForm(false);
      courseForm.reset({ level: 'BEGINNER', language: 'fr' });
    },
  });
  const deleteCourse = useMutation({
    mutationFn: catalogueApi.courses.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
  });
  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      catalogueApi.courses.update(id, { isPublished: published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          domains={domains}
          onClose={() => setEditingCourse(null)}
        />
      )}
      {managingCourse && (
        <ModulesDrawer course={managingCourse} onClose={() => setManagingCourse(null)} />
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-900">Catalogue</h1>
        <p className="text-sm text-gray-500">Gestion des domaines et des cours</p>
      </div>

      {/* Domains */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-brand" />
            Domaines ({domains.length})
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowDomainForm(!showDomainForm)}>
            <Plus className="size-3.5" />
            Domaine
          </Button>
        </CardHeader>
        <CardContent>
          {showDomainForm && (
            <form
              onSubmit={domainForm.handleSubmit((d) => createDomain.mutate(d))}
              className="mb-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3"
            >
              {createDomain.error && (
                <div className="sm:col-span-3 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                  {getApiErrorMessage(createDomain.error)}
                </div>
              )}
              <div className="space-y-1">
                <Label>Nom</Label>
                <Input placeholder="Développement" {...domainForm.register('name')} />
                {domainForm.formState.errors.name && (
                  <p className="text-xs text-red-500">{domainForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input placeholder="developpement" {...domainForm.register('slug')} />
                {domainForm.formState.errors.slug && (
                  <p className="text-xs text-red-500">{domainForm.formState.errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input placeholder="Optionnel" {...domainForm.register('description')} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-3">
                <Button type="submit" size="sm" loading={createDomain.isPending}>Créer le domaine</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowDomainForm(false)}>Annuler</Button>
              </div>
            </form>
          )}

          {domains.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Aucun domaine. Créez-en un pour ajouter des cours.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {domains.map((d) => (
                <span key={d.id} className="flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-sm text-navy">
                  <Library className="size-3 text-brand" />
                  {d.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-brand" />
            Cours ({courses.length})
          </CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setShowCourseForm(!showCourseForm)}
            disabled={domains.length === 0}
          >
            <Plus className="size-3.5" />
            Cours
          </Button>
        </CardHeader>
        <CardContent>
          {showCourseForm && (
            <form
              onSubmit={courseForm.handleSubmit((d) => createCourse.mutate(d))}
              className="mb-5 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2"
            >
              {createCourse.error && (
                <div className="sm:col-span-2 rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                  {getApiErrorMessage(createCourse.error)}
                </div>
              )}
              <div className="space-y-1">
                <Label>Titre</Label>
                <Input placeholder="Introduction au Cloud AWS" {...courseForm.register('title')} />
                {courseForm.formState.errors.title && (
                  <p className="text-xs text-red-500">{courseForm.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Domaine</Label>
                <select
                  {...courseForm.register('domainId')}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">Sélectionner…</option>
                  {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {courseForm.formState.errors.domainId && (
                  <p className="text-xs text-red-500">{courseForm.formState.errors.domainId.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Niveau</Label>
                <select
                  {...courseForm.register('level')}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Durée (min)</Label>
                  <Input type="number" placeholder="120" {...courseForm.register('duration')} />
                </div>
                <div className="space-y-1">
                  <Label>Prix (FCFA)</Label>
                  <Input type="number" placeholder="0" {...courseForm.register('price')} />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Description</Label>
                <Input placeholder="Résumé du cours" {...courseForm.register('description')} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>URL miniature</Label>
                <Input type="url" placeholder="https://..." {...courseForm.register('thumbnail')} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                <input type="checkbox" {...courseForm.register('isPublished')} className="size-4 rounded border-gray-300" />
                Publier immédiatement
              </label>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Button type="submit" size="sm" loading={createCourse.isPending}>Créer le cours</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCourseForm(false)}>Annuler</Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Chargement...</p>
          ) : courses.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Aucun cours pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="py-2 pr-4 font-semibold">Cours</th>
                    <th className="py-2 pr-4 font-semibold">Domaine</th>
                    <th className="py-2 pr-4 font-semibold">Niveau</th>
                    <th className="py-2 pr-4 font-semibold">Statut</th>
                    <th className="py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-400">{c._count?.modules ?? 0} module(s) · {c._count?.enrollments ?? 0} inscrit(s)</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{c.domain?.name ?? domainName(c.domainId)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{LEVEL_LABELS[c.level]}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => togglePublish.mutate({ id: c.id, published: !c.isPublished })}
                          className="inline-flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                        >
                          {c.isPublished ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Eye className="size-3" /> Publié
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <EyeOff className="size-3" /> Brouillon
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setEditingCourse(c)}
                            title="Modifier le cours"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => setManagingCourse(c)}
                            title="Gérer les modules"
                          >
                            <Layers className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm(`Supprimer « ${c.title} » ?`)) deleteCourse.mutate(c.id);
                            }}
                            title="Supprimer"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
