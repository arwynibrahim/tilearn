'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, UserCog, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalContent } from '@/components/ui/modal';
import { ConfirmDialog, ConfirmDialogContent, ConfirmDialogFooter } from '@/components/ui/confirm-dialog';
import { LoadingState, ErrorBanner } from '@/components/ui/status';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/dashboard';
import { usersApi } from '@/lib/api/users';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Role, User } from '@/types';
import { getPrimaryRole } from '@/types';

const ROLE_VARIANT: Record<Role, 'default' | 'secondary' | 'info' | 'warning'> = {
  LEARNER: 'default',
  CREATOR: 'info',
  MANAGER: 'warning',
  ADMIN: 'warning',
  SUPER_ADMIN: 'secondary',
};

const ROLE_LABELS: Record<Role, string> = {
  LEARNER: 'Apprenant',
  CREATOR: 'Formateur',
  MANAGER: 'Manager',
  ADMIN: 'Admin Institution',
  SUPER_ADMIN: 'Super Admin',
};

const editSchema = z.object({
  prenom: z.string().min(1, 'Requis'),
  nom: z.string().min(1, 'Requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

function EditModal({ user, onClose }: { user: User; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone ?? '',
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<User>) => usersApi.update(user.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({ title: 'Utilisateur modifié', variant: 'success' });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la mise à jour.')),
  });

  const onSubmit = (data: EditForm) => {
    setError(null);
    updateMut.mutate(data);
  };

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Modifier l'utilisateur" description={`Modifiez les informations de ${user.prenom} ${user.nom}.`}>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                {...register('prenom')}
                aria-invalid={!!errors.prenom}
                aria-describedby={errors.prenom ? 'prenom-error' : undefined}
                className={errors.prenom ? 'border-red-400' : ''}
              />
              {errors.prenom && <p id="prenom-error" className="text-xs text-red-500">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                {...register('nom')}
                aria-invalid={!!errors.nom}
                aria-describedby={errors.nom ? 'nom-error' : undefined}
                className={errors.nom ? 'border-red-400' : ''}
              />
              {errors.nom && <p id="nom-error" className="text-xs text-red-500">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && <p id="email-error" className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" type="tel" placeholder="+226 XX XX XX XX" {...register('telephone')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list', page],
    queryFn: () => usersApi.list(page, LIMIT),
    retry: false,
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast({ title: 'Utilisateur supprimé', variant: 'success' });
      setDeletingUser(null);
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: getApiErrorMessage(err, 'Suppression impossible'), variant: 'destructive' });
    },
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

      <ConfirmDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <ConfirmDialogContent
          title="Supprimer l'utilisateur"
          description={`Êtes-vous sûr de vouloir supprimer ${deletingUser?.prenom} ${deletingUser?.nom} ? Cette action est irréversible.`}
        >
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Annuler</Button>
            <Button
              variant="destructive"
              loading={deleteMut.isPending}
              onClick={() => deletingUser && deleteMut.mutate(deletingUser.id)}
            >
              Supprimer
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>

      <PageHeader
        title="Utilisateurs"
        description={`${data?.total ?? 0} utilisateurs au total`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Rechercher un utilisateur"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <div role="status" className="py-12 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Liste des utilisateurs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Utilisateur</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Rôle</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Inscrit le</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand" aria-hidden="true">
                            {user.prenom?.[0]}{user.nom?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.prenom} {user.nom}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {(() => { const r = getPrimaryRole(user); return r ? <Badge variant={ROLE_VARIANT[r]}>{ROLE_LABELS[r]}</Badge> : <Badge variant="default">—</Badge>; })()}
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
                            aria-label={`Modifier ${user.prenom} ${user.nom}`}
                          >
                            <UserCog className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeletingUser(user)}
                            aria-label={`Supprimer ${user.prenom} ${user.nom}`}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-400">Page {page} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Page précédente">
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Page suivante">
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
