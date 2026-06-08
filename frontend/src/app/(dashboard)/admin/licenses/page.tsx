'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, AlertCircle, Building2, Plus, X, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { b2bApi } from '@/lib/api/b2b';
import { usersApi } from '@/lib/api/users';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { License, LicensePlan } from '@/types';

const PLAN_LABELS: Record<LicensePlan, string> = {
  STARTER_10: 'Starter (10)',
  PRO_30: 'Pro (30)',
  PREMIUM_50: 'Premium (50)',
  ENTERPRISE_100: 'Enterprise (100)',
  UNLIMITED: 'Illimité',
};
const PLAN_VARIANT: Record<LicensePlan, 'default' | 'info' | 'secondary' | 'warning'> = {
  STARTER_10: 'default',
  PRO_30: 'info',
  PREMIUM_50: 'warning',
  ENTERPRISE_100: 'secondary',
  UNLIMITED: 'secondary',
};

const createSchema = z.object({
  organizationId: z.string().min(1, 'Requis'),
  plan: z.enum(['STARTER_10', 'PRO_30', 'PREMIUM_50', 'ENTERPRISE_100', 'UNLIMITED']),
  quantity: z.coerce.number().min(1).max(1000),
  startDate: z.string().min(1, 'Requis'),
  endDate: z.string().min(1, 'Requis'),
  price: z.coerce.number().optional(),
  autoRenew: z.boolean().default(false),
});
type CreateForm = z.infer<typeof createSchema>;

function CreateLicenseModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: orgs = [] } = useQuery({ queryKey: ['admin-orgs'], queryFn: b2bApi.organizations.list, retry: false });

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      organizationId: orgId,
      plan: 'PRO_30',
      quantity: 30,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getTime() + 365 * 24 * 3600_000).toISOString().split('T')[0],
      autoRenew: false,
    },
  });

  const createMut = useMutation({
    mutationFn: b2bApi.licenses.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licenses'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la création.')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Créer une licence</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit((d) => { setError(null); createMut.mutate(d); })} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-1.5">
            <Label>Organisation</Label>
            <select
              {...register('organizationId')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <select
                {...register('plan')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {(Object.keys(PLAN_LABELS) as LicensePlan[]).map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Nb sièges</Label>
              <Input type="number" {...register('quantity')} className={errors.quantity ? 'border-red-400' : ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Début</Label>
              <Input type="date" {...register('startDate')} className={errors.startDate ? 'border-red-400' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>Fin</Label>
              <Input type="date" {...register('endDate')} className={errors.endDate ? 'border-red-400' : ''} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prix (FCFA, optionnel)</Label>
            <Input type="number" placeholder="150000" {...register('price')} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('autoRenew')} className="rounded border-gray-300" />
            Renouvellement automatique
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={createMut.isPending}>Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({ license, onClose }: { license: License; onClose: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users-assign'],
    queryFn: () => usersApi.list(1, 50),
    retry: false,
  });

  const users = (usersData?.data ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const assignMut = useMutation({
    mutationFn: (userId: string) => b2bApi.licenses.assign(license.id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-licenses'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Erreur lors de l'assignation.")),
  });

  const slotsLeft = license.quantity - license.usedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Assigner une licence</h2>
            <p className="text-xs text-gray-400">{slotsLeft} siège(s) disponible(s)</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><X className="size-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}
          {slotsLeft <= 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
              <AlertCircle className="inline size-4 mr-1" />
              Tous les sièges sont utilisés.
            </div>
          )}

          <div className="relative">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-4"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={slotsLeft <= 0 || assignMut.isPending}
                onClick={() => { setError(null); assignMut.mutate(u.id); }}
                className="w-full flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-left text-sm hover:border-brand/30 hover:bg-brand/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{u.prenom} {u.nom}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <UserPlus className="size-4 text-gray-300 shrink-0" />
              </button>
            ))}
            {users.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LicenseCard({ license, onAssign }: { license: License; onAssign: () => void }) {
  const isExpired = new Date(license.endDate) < new Date();
  const usagePercent = license.quantity > 0 ? Math.round((license.usedCount / license.quantity) * 100) : 0;

  return (
    <Card className={`card-hover ${isExpired ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <BadgeCheck className="size-5 text-brand" />
          </div>
          <div className="flex gap-2">
            <Badge variant={PLAN_VARIANT[license.plan]}>{PLAN_LABELS[license.plan]}</Badge>
            {isExpired && <Badge variant="destructive">Expirée</Badge>}
          </div>
        </div>

        {license.organization && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {license.organization.name}
          </p>
        )}

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">Sièges utilisés</span>
            <span className="font-semibold text-gray-900">{license.usedCount} / {license.quantity}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-brand'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {usagePercent >= 90 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="size-3" />
              Capacité presque atteinte
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
          <span>Début {formatDate(license.startDate)}</span>
          <span className={isExpired ? 'text-red-400' : ''}>Fin: {formatDate(license.endDate)}</span>
        </div>

        {!isExpired && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-2"
            onClick={onAssign}
            disabled={license.usedCount >= license.quantity}
          >
            <UserPlus className="size-3.5" />
            Assigner un utilisateur
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function LicensesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [assigningLicense, setAssigningLicense] = useState<License | null>(null);

  const { data: orgs = [] } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  const orgId = selectedOrgId ?? orgs[0]?.id;

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ['admin-licenses', orgId],
    queryFn: () => b2bApi.licenses.listByOrg(orgId!),
    enabled: !!orgId,
    retry: false,
  });

  const active = licenses.filter((l) => new Date(l.endDate) >= new Date()).length;
  const expired = licenses.length - active;

  return (
    <div className="space-y-6">
      {showCreate && orgId && <CreateLicenseModal orgId={orgId} onClose={() => setShowCreate(false)} />}
      {assigningLicense && <AssignModal license={assigningLicense} onClose={() => setAssigningLicense(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Licences</h1>
          <p className="text-sm text-gray-500">{active} active(s) · {expired} expirée(s)</p>
        </div>
        {orgId && (
          <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Créer une licence
          </Button>
        )}
      </div>

      {orgs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                orgId === org.id
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="size-3.5" />
              {org.name}
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">Aucune organisation. Créez-en une pour gérer ses licences.</p>
          </CardContent>
        </Card>
      )}

      {orgId && (isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BadgeCheck className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="mb-4 text-gray-400">Aucune licence pour cette organisation.</p>
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" /> Créer la première licence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {licenses.map((license) => (
            <LicenseCard key={license.id} license={license} onAssign={() => setAssigningLicense(license)} />
          ))}
        </div>
      ))}
    </div>
  );
}
