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
import { Modal, ModalContent } from '@/components/ui/modal';
import { ConfirmDialog, ConfirmDialogContent, ConfirmDialogFooter } from '@/components/ui/confirm-dialog';
import { LoadingState } from '@/components/ui/status';
import { useToast } from '@/hooks/use-toast';
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

function ModulesDrawer({ course, onClose }: { course: Course; onClose: () => void }) {
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
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
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
        {/* Header */}
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

        {/* Quick-add form - always visible */}
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

        {/* Error */}
        {formError && (
          <div role="alert" className="mx-6 mt-3 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{formError}</div>
        )}

        {/* Module list */}
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

        {/* Footer */}
        <div className="border-t px-6 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {modules.length > 0 ? 'Terminé' : 'Passer - ajouter plus tard'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditCourseModal({ course, domains, onClose }: {
  course: Course;
  domains: { id: string; name: string }[];
  onClose: () => void;
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
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
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

function CreateDomainModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DomainForm>({
    resolver: zodResolver(domainSchema),
  });

  const createDomain = useMutation({
    mutationFn: catalogueApi.domains.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      toast({ title: 'Domaine créé', variant: 'success' });
      reset();
      onClose();
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: getApiErrorMessage(err, 'Création impossible'), variant: 'destructive' });
    },
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Créer un domaine">
        <form onSubmit={handleSubmit((d) => createDomain.mutate(d))} className="space-y-4">
          {createDomain.error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {getApiErrorMessage(createDomain.error)}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input placeholder="Développement" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input placeholder="developpement" {...register('slug')} />
            {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input placeholder="Optionnel" {...register('description')} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={createDomain.isPending}>Créer</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

function CreateCourseModal({ domains, onClose, onCreated }: { domains: { id: string; name: string }[]; onClose: () => void; onCreated: (course: Course) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { level: 'BEGINNER', language: 'fr' },
  });

  const createCourse = useMutation({
    mutationFn: catalogueApi.courses.create,
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
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

export default function CataloguePage() {
  const qc = useQueryClient();
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

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

  const deleteCourse = useMutation({
    mutationFn: catalogueApi.courses.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({ title: 'Cours supprimé', variant: 'success' });
      setDeletingCourse(null);
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: getApiErrorMessage(err, 'Suppression impossible'), variant: 'destructive' });
      setDeletingCourse(null);
    },
  });
  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      catalogueApi.courses.update(id, { isPublished: published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? '-';

  return (
    <div className="space-y-6">
      {showDomainModal && <CreateDomainModal onClose={() => setShowDomainModal(false)} />}
      {showCourseModal && (
        <CreateCourseModal
          domains={domains}
          onClose={() => setShowCourseModal(false)}
          onCreated={(course) => {
            setShowCourseModal(false);
            setManagingCourse(course);
          }}
        />
      )}
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

      <ConfirmDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <ConfirmDialogContent
          title="Supprimer le cours"
          description={`Êtes-vous sûr de vouloir supprimer « ${deletingCourse?.title} » ? Cette action est irréversible.`}
        >
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setDeletingCourse(null)}>Annuler</Button>
            <Button
              variant="destructive"
              loading={deleteCourse.isPending}
              onClick={() => deletingCourse && deleteCourse.mutate(deletingCourse.id)}
            >
              Supprimer
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>

      <div>
        <h1 className="text-2xl font-black text-gray-900">Catalogue</h1>
        <p className="text-sm text-gray-500">Gestion des domaines et des cours</p>
      </div>

      {/* Domains */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-brand" aria-hidden="true" />
            Domaines ({domains.length})
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowDomainModal(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            Domaine
          </Button>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p role="status" className="py-4 text-center text-sm text-gray-400">Aucun domaine. Créez-en un pour ajouter des cours.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {domains.map((d) => (
                <span key={d.id} className="flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-sm text-navy">
                  <Library className="size-3 text-brand" aria-hidden="true" />
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
            <BookOpen className="size-4 text-brand" aria-hidden="true" />
            Cours ({courses.length})
          </CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setShowCourseModal(true)}
            disabled={domains.length === 0}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Cours
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : courses.length === 0 ? (
            <p role="status" className="py-8 text-center text-sm text-gray-400">Aucun cours pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Liste des cours">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th scope="col" className="py-2 pr-4 font-semibold">Cours</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Domaine</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Niveau</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Statut</th>
                    <th scope="col" className="py-2 text-right font-semibold">Actions</th>
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
                          aria-label={c.isPublished ? `Dépublier ${c.title}` : `Publier ${c.title}`}
                        >
                          {c.isPublished ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Eye className="size-3" aria-hidden="true" /> Publié
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <EyeOff className="size-3" aria-hidden="true" /> Brouillon
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
                            aria-label={`Modifier ${c.title}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => setManagingCourse(c)}
                            aria-label={`Gérer les modules de ${c.title}`}
                          >
                            <Layers className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeletingCourse(c)}
                            aria-label={`Supprimer ${c.title}`}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
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
