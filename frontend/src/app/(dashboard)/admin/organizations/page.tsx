'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Globe, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { b2bApi } from '@/lib/api/b2b';
import { formatDate } from '@/lib/utils';
import type { OrganizationType } from '@/types';

const TYPE_LABELS: Record<OrganizationType, string> = {
  UNIVERSITY: 'Université',
  COMPANY: 'Entreprise',
  NGO: 'ONG',
  GOVERNMENT: 'Gouvernement',
};

const TYPE_VARIANT: Record<OrganizationType, 'info' | 'default' | 'success' | 'secondary'> = {
  UNIVERSITY: 'info',
  COMPANY: 'default',
  NGO: 'success',
  GOVERNMENT: 'secondary',
};

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  type: z.enum(['UNIVERSITY', 'COMPANY', 'NGO', 'GOVERNMENT']),
  country: z.string().min(2, 'Pays requis'),
  contactEmail: z.string().email('Email invalide'),
});
type FormData = z.infer<typeof schema>;

export default function OrganizationsPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  const createMut = useMutation({
    mutationFn: b2bApi.organizations.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orgs'] });
      setShowForm(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Organisations</h1>
          <p className="text-sm text-gray-500">{orgs.length} organisation(s) partenaire(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" />
          Nouvelle organisation
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-brand/20 bg-brand/5">
          <CardHeader>
            <h3 className="font-bold text-gray-900">Créer une organisation</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input placeholder="Université de Ouagadougou" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  {...register('type')}
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="UNIVERSITY">Université</option>
                  <option value="COMPANY">Entreprise</option>
                  <option value="NGO">ONG</option>
                  <option value="GOVERNMENT">Gouvernement</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Pays</Label>
                <Input placeholder="Burkina Faso" {...register('country')} />
                {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email de contact</Label>
                <Input type="email" placeholder="admin@org.bf" {...register('contactEmail')} />
                {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail.message}</p>}
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Button type="submit" loading={createMut.isPending}>Créer</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : orgs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">Aucune organisation enregistrée.</p>
            <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              Créer la première
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Card key={org.id} className="card-hover">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
                    <Building2 className="size-5 text-navy" />
                  </div>
                  <Badge variant={TYPE_VARIANT[org.type]}>{TYPE_LABELS[org.type]}</Badge>
                </div>
                <h3 className="mb-1 font-bold text-gray-900">{org.name}</h3>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Globe className="size-3.5" />
                    {org.country}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {org.contactEmail}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                  <span>{org._count?.licenses ?? 0} licence(s)</span>
                  <span>{formatDate(org.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
