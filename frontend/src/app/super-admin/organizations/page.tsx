'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Globe, AtSign, Phone, Headphones, BadgeCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalContent } from '@/components/ui/modal';
import { LoadingState } from '@/components/ui/status';
import { useToast } from '@/hooks/use-toast';
import { b2bApi } from '@/lib/api/b2b';
import { getApiErrorMessage } from '@/lib/api/client';
import { PageHeader } from '@/components/dashboard';
import { formatDate } from '@/lib/utils';
import type { OrganizationType, Organization } from '@/types';

const TYPE_LABELS: Record<OrganizationType, string> = {
  UNIVERSITY: 'Université',
  COMPANY: 'Entreprise',
  HOSPITAL: 'Hôpital',
  NGO: 'ONG',
  GOV: 'Gouvernement',
  BANK: 'Banque',
  INSTITUTE: 'Institut',
  SCHOOL: 'École',
  TRAINING_CENTER: 'Centre de formation',
  ASSOCIATION: 'Association',
  OTHER: 'Autre',
};

const TYPE_VARIANT: Record<OrganizationType, 'info' | 'default' | 'success' | 'secondary' | 'warning'> = {
  UNIVERSITY: 'info',
  COMPANY: 'default',
  HOSPITAL: 'warning',
  NGO: 'success',
  GOV: 'secondary',
  BANK: 'info',
  INSTITUTE: 'info',
  SCHOOL: 'success',
  TRAINING_CENTER: 'default',
  ASSOCIATION: 'success',
  OTHER: 'secondary',
};

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  type: z.enum(['UNIVERSITY', 'COMPANY', 'HOSPITAL', 'NGO', 'GOV', 'BANK', 'INSTITUTE', 'SCHOOL', 'TRAINING_CENTER', 'ASSOCIATION', 'OTHER']),
  country: z.string().optional(),
  emailDomain: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminEmail: z.string().email('Email invalide'),
  adminPrenom: z.string().min(2, 'Prénom requis'),
  adminNom: z.string().min(2, 'Nom requis'),
});
type FormData = z.infer<typeof schema>;

function CreateOrgModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'UNIVERSITY' },
  });

  const createMut = useMutation({
    mutationFn: b2bApi.organizations.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orgs'] });
      toast({ title: 'Organisation créée', variant: 'success' });
      reset();
      onClose();
    },
    onError: (err) => {
      toast({ title: 'Erreur', description: getApiErrorMessage(err, 'Création impossible'), variant: 'destructive' });
    },
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Créer une organisation">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
          {createMut.error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {getApiErrorMessage(createMut.error)}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
            <h4 className="mb-3 text-sm font-semibold text-brand">Responsable organisation</h4>
            <p className="mb-3 text-xs text-gray-500">
              Un email sera envoyé avec les identifiants de connexion au tableau de bord administration.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Email du responsable</Label>
                <Input
                  type="email"
                  placeholder="admin@universite.bf"
                  {...register('adminEmail')}
                  className={errors.adminEmail ? 'border-red-400' : ''}
                />
                {errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input placeholder="Jean" {...register('adminPrenom')} />
                {errors.adminPrenom && <p className="text-xs text-red-500">{errors.adminPrenom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input placeholder="Dupont" {...register('adminNom')} />
                {errors.adminNom && <p className="text-xs text-red-500">{errors.adminNom.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={createMut.isPending}>Créer</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default function OrganizationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  return (
    <div className="space-y-6">
      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} />}

      <PageHeader
        title="Organisations"
        description={`${orgs.length} organisation(s) partenaire(s)`}
        action={
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle organisation
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : orgs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
            <p className="text-gray-400">Aucune organisation enregistrée.</p>
            <Button className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" aria-hidden="true" />
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
                    <Building2 className="size-5 text-navy" aria-hidden="true" />
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
                      <Globe className="size-3.5" aria-hidden="true" />
                      {org.country}
                    </div>
                  )}
                  {org.emailDomain && (
                    <div className="flex items-center gap-1.5">
                      <AtSign className="size-3.5" aria-hidden="true" />
                      {org.emailDomain}
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5" aria-hidden="true" />
                      {org.phone}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <BadgeCheck className="size-3" aria-hidden="true" />
                    {org._count?.licenses ?? 0} licence(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="size-3" aria-hidden="true" />
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
