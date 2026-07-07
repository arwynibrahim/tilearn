'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Search, Pencil, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalContent } from '@/components/ui/modal';
import { LoadingState, ErrorBanner } from '@/components/ui/status';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/client';
import type { User } from '@/types';

const editSchema = z.object({
  prenom: z.string().min(1, 'Requis'),
  nom: z.string().min(1, 'Requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

function EditInstructorModal({ user, onClose }: { user: User; onClose: () => void }) {
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
      toast({ title: 'Instructeur modifié', variant: 'success' });
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
      <ModalContent title="Modifier l'instructeur" description={`Modifiez les informations de ${user.prenom} ${user.nom}.`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                {...register('prenom')}
                aria-invalid={!!errors.prenom}
                className={errors.prenom ? 'border-red-400' : ''}
              />
              {errors.prenom && <p className="text-xs text-red-500">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                {...register('nom')}
                aria-invalid={!!errors.nom}
                className={errors.nom ? 'border-red-400' : ''}
              />
              {errors.nom && <p className="text-xs text-red-500">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
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

function InstructorCard({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand" aria-hidden="true">
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900">{user.prenom} {user.nom}</h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <Badge variant="info">Instructeur</Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 text-xs text-gray-400">
          <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
          {user.lastLoginAt && (
            <span>· Dernière connexion le {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 hover:bg-blue-50 hover:text-blue-600"
            onClick={onEdit}
            aria-label={`Modifier ${user.prenom} ${user.nom}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InstructorsPage() {
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => usersApi.list(1, 200),
    retry: false,
  });

  const allUsers = usersData?.data ?? [];
  const instructors = allUsers.filter((u) => u.memberships?.some((m) => m.role === 'CREATOR'));
  const filtered = instructors.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {editingUser && <EditInstructorModal user={editingUser} onClose={() => setEditingUser(null)} />}

      <div>
        <h1 className="text-2xl font-black text-gray-900">Instructeurs</h1>
        <p className="text-sm text-gray-500">{instructors.length} instructeur(s) enregistré(s)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Rechercher un instructeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Rechercher un instructeur"
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
            <p className="text-gray-400">
              {search ? 'Aucun instructeur trouvé pour cette recherche.' : 'Aucun instructeur enregistré.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <InstructorCard key={user.id} user={user} onEdit={() => setEditingUser(user)} />
          ))}
        </div>
      )}
    </div>
  );
}
