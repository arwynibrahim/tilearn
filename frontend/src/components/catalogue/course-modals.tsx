'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, BookOpen, Layers, Pencil, X, Save, Play, FileText, Headphones, HelpCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalContent } from '@/components/ui/modal';
import { LoadingState } from '@/components/ui/status';
import { useToast } from '@/hooks/use-toast';
import { catalogueApi } from '@/lib/api/catalogue';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Course, CourseLevel, Module, ModuleType } from '@/types';

export const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};
export const MODULE_TYPES: ModuleType[] = ['VIDEO', 'TEXT', 'QUIZ', 'VR'];
export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  VIDEO: 'Vidéo',
  TEXT: 'Lecture',
  QUIZ: 'Quiz',
  VR: 'Réalité virtuelle',
};
export const MODULE_TYPE_ICON: Record<ModuleType, React.ElementType> = {
  VIDEO: Play,
  TEXT: FileText,
  QUIZ: HelpCircle,
  VR: Headphones,
};

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

export function ModulesDrawer({ course, onClose, coursesQueryKey }: {
  course: Course;
  onClose: () => void;
  coursesQueryKey: unknown[];
}) {
  const qc = useQueryClient();
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['course-modules', course.id],
    queryFn: () => catalogueApi.modules.listByCourse(course.id),
  });

  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm<ModuleForm>({
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
      qc.invalidateQueries({ queryKey: coursesQueryKey });
      reset({ type: 'VIDEO', isRequired: true });
      setFormError(null);
      toast({ title: 'Module ajouté', variant: 'success' });
      setTimeout(() => setFocus('title'), 50);
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
      toast({ title: 'Module modifié', variant: 'success' });
    },
    onError: (err) => setFormError(getApiErrorMessage(err, 'Erreur lors de la modification.')),
  });

  const startEdit = (mod: Module) => {
    setEditingModule(mod);
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
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={`Modules de ${course.title}`}>
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Modules du cours</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{course.title}</p>
            {modules.length > 0 && (
              <p className="mt-0.5 text-xs text-gray-400">{modules.length} module(s)</p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Fermer">
            <X className="size-4 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b bg-gray-50 px-6 py-3">
          <form
            onSubmit={handleSubmit((d) => { setFormError(null); addModule.mutate(d); })}
            className="flex items-end gap-2"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="quick-add-title" className="text-xs">Titre du module</Label>
              <Input
                id="quick-add-title"
                placeholder="Ex: Introduction à la VR"
                {...register('title', { required: true })}
                className={errors.title ? 'border-red-400' : ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit((d) => { setFormError(null); addModule.mutate(d); })();
                  }
                }}
              />
            </div>
            <div className="w-32 space-y-1">
              <Label htmlFor="quick-add-type" className="text-xs">Type</Label>
              <select
                id="quick-add-type"
                {...register('type')}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {MODULE_TYPES.map((t) => (
                  <option key={t} value={t}>{MODULE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" loading={addModule.isPending} className="gap-1 shrink-0">
              <Plus className="size-3.5" aria-hidden="true" />
              Ajouter
            </Button>
          </form>
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {formError && (
          <div role="alert" className="mx-6 mt-3 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{formError}</div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <LoadingState />
          ) : modules.length === 0 ? (
            <div className="py-10 text-center">
              <BookOpen className="mx-auto mb-3 size-10 text-gray-200" aria-hidden="true" />
              <p className="text-sm text-gray-400">Aucun module. Ajoutez-en un ci-dessus.</p>
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {modules.map((mod, idx) => {
                const Icon = MODULE_TYPE_ICON[mod.type];
                const isEditing = editingModule?.id === mod.id;
                return (
                  <li key={mod.id} className={`rounded-xl border transition-colors ${isEditing ? 'border-brand/30 bg-brand/5' : 'bg-white'}`}>
                    {isEditing ? (
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
                            <Label>Durée (sec)</Label>
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
                            <Save className="size-3.5" aria-hidden="true" /> Enregistrer
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditingModule(null)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3 p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                          <Icon className="size-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{mod.title}</p>
                          <p className="text-xs text-gray-400">
                            {MODULE_TYPE_LABELS[mod.type]}
                            {mod.durationSeconds ? ` · ${Math.ceil(mod.durationSeconds / 60)} min` : ''}
                            {mod.isRequired ? ' · Requis' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => startEdit(mod)}
                            aria-label={`Modifier ${mod.title}`}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t px-6 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {modules.length > 0 ? 'Terminé' : 'Passer - ajouter plus tard'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EditCourseModal({ course, domains, onClose, coursesQueryKey }: {
  course: Course;
  domains: { id: string; name: string }[];
  onClose: () => void;
  coursesQueryKey: unknown[];
}) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      qc.invalidateQueries({ queryKey: coursesQueryKey });
      qc.invalidateQueries({ queryKey: ['course', course.slug] });
      toast({ title: 'Cours modifié', variant: 'success' });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la modification.')),
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Modifier le cours" className="max-w-xl">
        <form
          onSubmit={handleSubmit((d) => { setError(null); updateMut.mutate(d); })}
          className="max-h-[70vh] overflow-y-auto space-y-4"
        >
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
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
              <Save className="size-4" aria-hidden="true" />
              Enregistrer
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function CreateCourseModal({ domains, onClose, onCreated, coursesQueryKey }: {
  domains: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (course: Course) => void;
  coursesQueryKey: unknown[];
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { level: 'BEGINNER', language: 'fr' },
  });

  const createCourse = useMutation({
    mutationFn: catalogueApi.courses.create,
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: coursesQueryKey });
      toast({ title: 'Cours créé - ajoutez des modules', variant: 'success' });
      reset({ level: 'BEGINNER', language: 'fr' });
      onCreated(course);
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: getApiErrorMessage(err, 'Création impossible'), variant: 'destructive' });
    },
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Créer un cours" className="max-w-xl">
        <form onSubmit={handleSubmit((d) => createCourse.mutate(d))} className="max-h-[70vh] overflow-y-auto space-y-4">
          {createCourse.error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {getApiErrorMessage(createCourse.error)}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input placeholder="Introduction au Cloud AWS" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Domaine</Label>
              <select
                {...register('domainId')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Sélectionner…</option>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.domainId && <p className="text-xs text-red-500">{errors.domainId.message}</p>}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Durée (min)</Label>
              <Input type="number" placeholder="120" {...register('duration')} />
            </div>
            <div className="space-y-1.5">
              <Label>Prix (FCFA)</Label>
              <Input type="number" placeholder="0" {...register('price')} />
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
            Publier immédiatement
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={createCourse.isPending}>Créer le cours</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
