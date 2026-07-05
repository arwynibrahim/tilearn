'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Library, BookOpen, Trash2, Eye, EyeOff, Layers, Pencil } from 'lucide-react';
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
import {
  CreateCourseModal, EditCourseModal, ModulesDrawer, LEVEL_LABELS,
} from '@/components/catalogue/course-modals';
import type { Course } from '@/types';

const ADMIN_COURSES_QUERY_KEY = ['admin-courses'];

const domainSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  slug: z.string().min(2, 'Slug requis').regex(/^[a-z0-9-]+$/, 'minuscules, chiffres, tirets'),
  description: z.string().optional(),
});
type DomainForm = z.infer<typeof domainSchema>;

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
    queryKey: ADMIN_COURSES_QUERY_KEY,
    queryFn: () => catalogueApi.courses.list({ limit: 100 }),
    retry: false,
  });
  const courses = coursesPage?.data ?? [];

  const deleteCourse = useMutation({
    mutationFn: catalogueApi.courses.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY });
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY }),
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
          coursesQueryKey={ADMIN_COURSES_QUERY_KEY}
        />
      )}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          domains={domains}
          onClose={() => setEditingCourse(null)}
          coursesQueryKey={ADMIN_COURSES_QUERY_KEY}
        />
      )}
      {managingCourse && (
        <ModulesDrawer
          course={managingCourse}
          onClose={() => setManagingCourse(null)}
          coursesQueryKey={ADMIN_COURSES_QUERY_KEY}
        />
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
