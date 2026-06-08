'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, UserCog, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usersApi } from '@/lib/api/users';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Role, User } from '@/types';

const ROLE_VARIANT: Record<Role, 'default' | 'secondary' | 'info' | 'warning'> = {
  LEARNER: 'default',
  INSTRUCTOR: 'info',
  ADMIN_INSTITUTION: 'warning',
  SUPER_ADMIN: 'secondary',
};

const ROLE_LABELS: Record<Role, string> = {
  LEARNER: 'Apprenant',
  INSTRUCTOR: 'Instructeur',
  ADMIN_INSTITUTION: 'Admin Institution',
  SUPER_ADMIN: 'Super Admin',
};

const editSchema = z.object({
  prenom: z.string().min(1, 'Requis'),
  nom: z.string().min(1, 'Requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  role: z.enum(['LEARNER', 'INSTRUCTOR', 'ADMIN_INSTITUTION', 'SUPER_ADMIN']),
});
type EditForm = z.infer<typeof editSchema>;

function EditModal({ user, onClose }: { user: User; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone ?? '',
      role: user.role,
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<User>) => usersApi.update(user.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-list'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la mise à jour.')),
  });

  const onSubmit = (data: EditForm) => {
    setError(null);
    updateMut.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Modifier l&apos;utilisateur</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" {...register('prenom')} className={errors.prenom ? 'border-red-400' : ''} />
              {errors.prenom && <p className="text-xs text-red-500">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" {...register('nom')} className={errors.nom ? 'border-red-400' : ''} />
              {errors.nom && <p className="text-xs text-red-500">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-400' : ''} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" type="tel" placeholder="+226 XX XX XX XX" {...register('telephone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Rôle</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const qc = useQueryClient();
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list', page],
    queryFn: () => usersApi.list(page, LIMIT),
    retry: false,
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users-list'] }),
  });

  const filtered = data?.data?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }) ?? [];

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-6">
      {editingUser && <EditModal user={editingUser} onClose={() => setEditingUser(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} utilisateurs au total</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Utilisateur</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Rôle</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Inscrit le</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            {user.prenom?.[0]}{user.nom?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.prenom} {user.nom}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={ROLE_VARIANT[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={user.deletedAt ? 'destructive' : 'success'}>
                          {user.deletedAt ? 'Désactivé' : 'Actif'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setEditingUser(user)}
                            title="Modifier"
                          >
                            <UserCog className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) {
                                deleteMut.mutate(user.id);
                              }
                            }}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-400">Page {page} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
