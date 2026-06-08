'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Globe, AtSign, Phone, Headphones, BadgeCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { b2bApi } from '@/lib/api/b2b';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import type { OrganizationType } from '@/types';

const TYPE_LABELS: Record<OrganizationType, string> = {
  UNIVERSITY: 'Université',
  COMPANY: 'Entreprise',
  HOSPITAL: 'Hôpital',
  NGO: 'ONG',
  GOV: 'Gouvernement',
};

const TYPE_VARIANT: Record<OrganizationType, 'info' | 'default' | 'success' | 'secondary' | 'warning'> = {
  UNIVERSITY: 'info',
  COMPANY: 'default',
  HOSPITAL: 'warning',
  NGO: 'success',
  GOV: 'secondary',
};

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  type: z.enum(['UNIVERSITY', 'COMPANY', 'HOSPITAL', 'NGO', 'GOV']),
  country: z.string().optional(),
  emailDomain: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
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
    defaultValues: { type: 'UNIVERSITY' },
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

      {showForm && (
        <Card className="border-brand/20 bg-brand/5">
          <CardHeader>
            <h3 className="font-bold text-gray-900">Créer une organisation</h3>
          </CardHeader>
          <CardContent>
            {createMut.error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {getApiErrorMessage(createMut.error)}
              </div>
            )}
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
                  {(Object.keys(TYPE_LABELS) as OrganizationType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Pays</Label>
                <Input placeholder="Burkina Faso" {...register('country')} />
              </div>
              <div className="space-y-1.5">
                <Label>Domaine email</Label>
                <Input placeholder="univ-ouaga.bf" {...register('emailDomain')} />
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input placeholder="+226 70 00 00 00" {...register('phone')} />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input placeholder="Ouagadougou" {...register('address')} />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Button type="submit" loading={createMut.isPending}>Créer</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <div className="flex gap-2">
                    <Badge variant={TYPE_VARIANT[org.type]}>{TYPE_LABELS[org.type]}</Badge>
                    {!org.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                </div>
                <h3 className="mb-1 font-bold text-gray-900">{org.name}</h3>
                <div className="space-y-1 text-sm text-gray-500">
                  {org.country && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-3.5" />
                      {org.country}
                    </div>
                  )}
                  {org.emailDomain && (
                    <div className="flex items-center gap-1.5">
                      <AtSign className="size-3.5" />
                      {org.emailDomain}
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {org.phone}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <BadgeCheck className="size-3" />
                    {org._count?.licenses ?? 0} licence(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="size-3" />
                    {org._count?.vrHeadsets ?? 0} casque(s)
                  </span>
                  <span className="ml-auto">{formatDate(org.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
