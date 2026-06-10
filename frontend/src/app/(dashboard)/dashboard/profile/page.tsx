'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, User, Mail, Phone, Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/lib/api/client';
import { getInitials } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  LEARNER: 'Apprenant',
  INSTRUCTOR: 'Instructeur',
  ADMIN_INSTITUTION: 'Admin Institution',
  SUPER_ADMIN: 'Super Admin',
};

const schema = z.object({
  prenom: z.string().min(1, 'Requis'),
  nom: z.string().min(1, 'Requis'),
  telephone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prenom: user?.prenom ?? '',
      nom: user?.nom ?? '',
      telephone: user?.telephone ?? '',
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<FormData>) => usersApi.update(user!.id, data),
    onSuccess: (updated) => {
      const stored = localStorage.getItem('refreshToken') ?? '';
      const accessToken = localStorage.getItem('accessToken') ?? '';
      setAuth(updated, accessToken, stored);
      qc.invalidateQueries({ queryKey: ['admin-users-list'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la mise à jour.')),
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setSaved(false);
    updateMut.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500">Modifiez vos informations personnelles</p>
      </div>

      {/* Avatar card */}
      <Card>
        <CardContent className="flex items-center gap-5 p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-2xl font-black text-brand">
            {getInitials(user.prenom, user.nom)}
          </div>
          <div>
            <p className="text-xl font-black text-gray-900">{user.prenom} {user.nom}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{ROLE_LABELS[user.role] ?? user.role}</Badge>
              {user.emailVerifiedAt && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="size-3" /> Email vérifié
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-brand" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>
          )}
          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-600">
              <CheckCircle2 className="size-4" />
              Profil mis à jour avec succès.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Label className="flex items-center gap-2">
                <Mail className="size-3.5 text-gray-400" />
                Email
              </Label>
              <Input value={user.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-400">L&apos;email ne peut pas être modifié ici.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <Phone className="size-3.5 text-gray-400" />
                Téléphone
              </Label>
              <Input id="telephone" type="tel" placeholder="+226 XX XX XX XX" {...register('telephone')} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Shield className="size-3.5 text-gray-400" />
                Rôle
              </Label>
              <Input value={ROLE_LABELS[user.role] ?? user.role} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button type="submit" loading={updateMut.isPending} disabled={!isDirty} className="gap-2">
                <Save className="size-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
