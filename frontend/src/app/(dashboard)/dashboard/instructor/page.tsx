'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, BookOpen, Star, TrendingUp, Save, Edit3, Users, MessageSquare, Plus, Pencil, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { instructorApi } from '@/lib/api/instructor';
import { catalogueApi } from '@/lib/api/catalogue';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import { CreateCourseModal, EditCourseModal, ModulesDrawer } from '@/components/catalogue/course-modals';
import type { InstructorProfile, CourseReview, Course } from '@/types';

const INSTRUCTOR_COURSES_QUERY_KEY = ['instructor-courses'];

const profileSchema = z.object({
  bio: z.string().optional(),
  expertiseAreas: z.string().optional(),
  bankAccountInfo: z.string().optional(),
  taxId: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileEditor({ profile, onClose }: { profile: InstructorProfile | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile?.bio ?? '',
      expertiseAreas: profile?.expertiseAreas?.join(', ') ?? '',
      bankAccountInfo: profile?.bankAccountInfo ?? '',
      taxId: profile?.taxId ?? '',
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: ProfileForm) => instructorApi.profile.update({
      ...data,
      expertiseAreas: data.expertiseAreas ? data.expertiseAreas.split(',').map((s) => s.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor-profile'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la mise à jour.')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Mon profil instructeur</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <span className="text-gray-500">&times;</span>
          </button>
        </div>
        <form onSubmit={handleSubmit((d) => { setError(null); updateMut.mutate(d); })} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio / Présentation</Label>
            <textarea
              id="bio"
              rows={4}
              {...register('bio')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Décrivez votre parcours et votre expertise..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expertiseAreas">Domaines d&apos;expertise (séparés par des virgules)</Label>
            <Input id="expertiseAreas" placeholder="VR, E-learning, Pédagogie..." {...register('expertiseAreas')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bankAccountInfo">Compte bancaire</Label>
              <Input id="bankAccountInfo" placeholder="Informations bancaires" {...register('bankAccountInfo')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">Identifiant fiscal</Label>
              <Input id="taxId" placeholder="N° fiscal" {...register('taxId')} />
            </div>
          </div>

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

export default function InstructorDashboard() {
  const [editing, setEditing] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['instructor-profile'],
    queryFn: instructorApi.profile.get,
    retry: false,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: catalogueApi.domains.list,
    retry: false,
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: INSTRUCTOR_COURSES_QUERY_KEY,
    queryFn: instructorApi.courses.listMine,
    retry: false,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: instructorApi.stats.get,
    retry: false,
  });

  const allCourseIds = courses.map((c) => c.id);

  return (
    <div className="space-y-6">
      {editing && <ProfileEditor profile={profile ?? null} onClose={() => setEditing(false)} />}
      {showCourseModal && (
        <CreateCourseModal
          domains={domains}
          onClose={() => setShowCourseModal(false)}
          onCreated={(course) => {
            setShowCourseModal(false);
            setManagingCourse(course);
          }}
          coursesQueryKey={INSTRUCTOR_COURSES_QUERY_KEY}
        />
      )}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          domains={domains}
          onClose={() => setEditingCourse(null)}
          coursesQueryKey={INSTRUCTOR_COURSES_QUERY_KEY}
        />
      )}
      {managingCourse && (
        <ModulesDrawer
          course={managingCourse}
          onClose={() => setManagingCourse(null)}
          coursesQueryKey={INSTRUCTOR_COURSES_QUERY_KEY}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Espace Instructeur</h1>
          <p className="text-sm text-gray-500">Gérez votre profil, vos cours et suivez vos statistiques</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditing(true)}>
          <Edit3 className="size-4" />
          Modifier le profil
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: BookOpen, label: 'Mes cours', value: stats?.totalCourses ?? courses.length, color: 'bg-brand' },
          { icon: Users, label: 'Inscriptions', value: stats?.totalEnrollments ?? 0, color: 'bg-green-500' },
          { icon: Star, label: 'Avis reçus', value: stats?.totalReviews ?? 0, color: 'bg-amber-500' },
          { icon: TrendingUp, label: 'Note moyenne', value: stats?.averageRating ? stats.averageRating.toFixed(1) : '-', color: 'bg-blue-500' },
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

      {/* Profile summary */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-brand" />
              Mon profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bio</p>
                <p className="mt-1 text-sm text-gray-700">{profile.bio || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Expertise</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile.expertiseAreas?.length ? (
                    profile.expertiseAreas.map((area) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Non renseigné</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My courses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-brand" />
            Mes cours
          </CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setShowCourseModal(true)}
            disabled={domains.length === 0}
          >
            <Plus className="size-3.5" />
            Créer un cours
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingCourses ? (
            <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-3 size-12 text-gray-200" />
              <p className="text-gray-400">Vous n&apos;avez pas encore de cours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Cours</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Domaine</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Modules</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Inscriptions</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Créé le</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{c.title}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{c.domain?.name ?? '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c._count?.modules ?? 0}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c._count?.enrollments ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={c.isPublished ? 'success' : 'warning'}>
                          {c.isPublished ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setEditingCourse(c)}
                            aria-label={`Modifier ${c.title}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => setManagingCourse(c)}
                            aria-label={`Gérer les modules de ${c.title}`}
                          >
                            <Layers className="size-4" />
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
