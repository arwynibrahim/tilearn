'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Headphones, Battery, Wifi, WifiOff, Zap, Wrench, Eye, HelpCircle,
  Building2, Plus, RefreshCw, UserPlus, Search,
} from 'lucide-react';
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
import { mdmApi } from '@/lib/api/mdm';
import { b2bApi } from '@/lib/api/b2b';
import { usersApi } from '@/lib/api/users';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { HeadsetStatus, HeadsetModel, VRHeadset } from '@/types';

const STATUS_CONFIG: Record<HeadsetStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info' | 'secondary'; icon: React.ElementType }> = {
  ONLINE: { label: 'En ligne', variant: 'success', icon: Wifi },
  OFFLINE: { label: 'Hors ligne', variant: 'destructive', icon: WifiOff },
  CHARGING: { label: 'En charge', variant: 'warning', icon: Zap },
  IN_USE: { label: 'En usage', variant: 'info', icon: Eye },
  MAINTENANCE: { label: 'Maintenance', variant: 'secondary', icon: Wrench },
  LOST: { label: 'Perdu', variant: 'destructive', icon: HelpCircle },
};

const MODEL_LABELS: Record<HeadsetModel, string> = {
  META_QUEST_2: 'Meta Quest 2',
  META_QUEST_3: 'Meta Quest 3',
  PICO_4: 'Pico 4',
};

const addSchema = z.object({
  serialNumber: z.string().min(1, 'Requis'),
  model: z.enum(['META_QUEST_2', 'META_QUEST_3', 'PICO_4']),
  firmwareVersion: z.string().optional(),
  batteryLevel: z.coerce.number().min(0).max(100).optional(),
});
type AddForm = z.infer<typeof addSchema>;

function AddHeadsetModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { model: 'META_QUEST_3' },
  });

  const addMut = useMutation({
    mutationFn: (data: AddForm) => mdmApi.headsets.create({ ...data, organizationId: orgId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-headsets', orgId] });
      qc.invalidateQueries({ queryKey: ['admin-orgs'] });
      toast({ title: 'Casque ajouté', variant: 'success' });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Erreur lors de l'ajout.")),
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Ajouter un casque">
        <form onSubmit={handleSubmit((d) => { setError(null); addMut.mutate(d); })} className="space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">Numéro de série</Label>
            <Input id="serialNumber" placeholder="1WMHH..." {...register('serialNumber')} className={errors.serialNumber ? 'border-red-400' : ''} />
            {errors.serialNumber && <p className="text-xs text-red-500">{errors.serialNumber.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model">Modèle</Label>
            <select
              id="model"
              {...register('model')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {(Object.keys(MODEL_LABELS) as HeadsetModel[]).map((m) => (
                <option key={m} value={m}>{MODEL_LABELS[m]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firmwareVersion">Firmware (optionnel)</Label>
              <Input id="firmwareVersion" placeholder="v62.0" {...register('firmwareVersion')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batteryLevel">Batterie %</Label>
              <Input id="batteryLevel" type="number" min="0" max="100" placeholder="100" {...register('batteryLevel')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={addMut.isPending}>Ajouter</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

function AssignHeadsetModal({ headset, onClose }: { headset: VRHeadset; onClose: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: usersData } = useQuery({
    queryKey: ['users-assign-headset'],
    queryFn: () => usersApi.list(1, 50),
    retry: false,
  });

  const users = (usersData?.data ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const assignMut = useMutation({
    mutationFn: (userId: string) => mdmApi.headsets.assign(headset.id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-headsets', headset.organizationId] });
      toast({ title: 'Casque assigné', variant: 'success' });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Erreur lors de l'assignation.")),
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Assigner le casque" description={headset.serialNumber}>
        <div className="space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Rechercher un utilisateur"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={assignMut.isPending}
                onClick={() => { setError(null); assignMut.mutate(u.id); }}
                className="w-full flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-left text-sm hover:border-brand/30 hover:bg-brand/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand" aria-hidden="true">
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{u.prenom} {u.nom}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <UserPlus className="size-4 text-gray-300 shrink-0" aria-hidden="true" />
              </button>
            ))}
            {users.length === 0 && (
              <p role="status" className="py-6 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function StatusModal({ headset, onClose }: { headset: VRHeadset; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<HeadsetStatus>(headset.status);
  const [battery, setBattery] = useState<string>(headset.batteryLevel?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateMut = useMutation({
    mutationFn: () => mdmApi.headsets.updateStatus(
      headset.id,
      status,
      battery !== '' ? Number(battery) : undefined,
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-headsets', headset.organizationId] });
      toast({ title: 'Statut mis à jour', variant: 'success' });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur.')),
  });

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Modifier le statut">
        <div className="space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <p className="text-sm text-gray-500 font-mono">{headset.serialNumber}</p>

          <div className="space-y-1.5">
            <Label>Statut</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_CONFIG) as HeadsetStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium transition-all ${
                      status === s ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <cfg.icon className="size-3.5" aria-hidden="true" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batteryMod">Niveau de batterie %</Label>
            <Input
              id="batteryMod"
              type="number"
              min="0"
              max="100"
              value={battery}
              onChange={(e) => setBattery(e.target.value)}
              placeholder="Laisser vide pour ne pas modifier"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={() => updateMut.mutate()} loading={updateMut.isPending}>Enregistrer</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

export default function MdmPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingHeadset, setEditingHeadset] = useState<VRHeadset | null>(null);
  const [assigningHeadset, setAssigningHeadset] = useState<VRHeadset | null>(null);
  const qc = useQueryClient();

  const { data: orgs = [] } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  const orgId = selectedOrgId ?? orgs[0]?.id;

  const { data: headsets = [], isLoading } = useQuery({
    queryKey: ['admin-headsets', orgId],
    queryFn: () => mdmApi.headsets.listByOrg(orgId!),
    enabled: !!orgId,
    retry: false,
    refetchInterval: 30_000,
  });

  const byStatus = (s: HeadsetStatus) => headsets.filter((h) => h.status === s).length;

  return (
    <div className="space-y-6">
      {showAdd && orgId && <AddHeadsetModal orgId={orgId} onClose={() => setShowAdd(false)} />}
      {editingHeadset && <StatusModal headset={editingHeadset} onClose={() => setEditingHeadset(null)} />}
      {assigningHeadset && <AssignHeadsetModal headset={assigningHeadset} onClose={() => setAssigningHeadset(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Parc VR — MDM</h1>
          <p className="text-sm text-gray-500">Gestion de la flotte de casques VR par organisation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => qc.invalidateQueries({ queryKey: ['admin-headsets', orgId] })}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Actualiser
          </Button>
          {orgId && (
            <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Ajouter un casque
            </Button>
          )}
        </div>
      </div>

      {/* Org selector */}
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
              <Building2 className="size-3.5" aria-hidden="true" />
              {org.name}
              {org._count?.vrHeadsets != null && (
                <span className="text-xs opacity-70">({org._count.vrHeadsets})</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
            <p className="text-gray-400">Aucune organisation. Créez-en une pour gérer ses casques.</p>
          </CardContent>
        </Card>
      )}

      {/* Status summary */}
      {orgId && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {(Object.keys(STATUS_CONFIG) as HeadsetStatus[]).map((s) => {
            const config = STATUS_CONFIG[s];
            return (
              <Card key={s}>
                <CardContent className="flex items-center gap-2 p-3">
                  <config.icon className="size-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-xs text-gray-500">{config.label}</p>
                    <p className="text-xl font-black text-gray-900">{byStatus(s)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Headsets grid */}
      {orgId && (isLoading ? (
        <LoadingState />
      ) : headsets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Headphones className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
            <p className="mb-4 text-gray-400">Aucun casque enregistré pour cette organisation.</p>
            <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="size-4" aria-hidden="true" /> Ajouter le premier casque
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {headsets.map((h) => {
            const config = STATUS_CONFIG[h.status];
            const battery = h.batteryLevel ?? 0;
            const batteryColor = battery >= 60 ? 'text-green-500' : battery >= 30 ? 'text-amber-500' : 'text-red-500';
            const batteryBg = battery >= 60 ? 'bg-green-500' : battery >= 30 ? 'bg-amber-500' : 'bg-red-500';

            return (
              <Card key={h.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
                      <Headphones className="size-5 text-navy" aria-hidden="true" />
                    </div>
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      <config.icon className="size-3" aria-hidden="true" />
                      {config.label}
                    </Badge>
                  </div>

                  <p className="font-semibold text-gray-900">{MODEL_LABELS[h.model]}</p>
                  <p className="mb-3 text-xs font-mono text-gray-400">{h.serialNumber}</p>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Battery className="size-3" aria-hidden="true" /> Batterie
                      </span>
                      <span className={`font-semibold ${batteryColor}`}>
                        {h.batteryLevel != null ? `${h.batteryLevel}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100" role="progressbar" aria-valuenow={battery} aria-valuemin={0} aria-valuemax={100} aria-label={`Batterie ${battery}%`}>
                      <div className={`h-full rounded-full ${batteryBg}`} style={{ width: `${battery}%` }} />
                    </div>
                  </div>

                  {h.firmwareVersion && <p className="text-xs text-gray-400">Firmware {h.firmwareVersion}</p>}
                  {h.lastPing && <p className="text-xs text-gray-400">Vu: {formatDate(h.lastPing)}</p>}
                  {h.assignedUser && (
                    <p className="mt-1 truncate text-xs text-brand">
                      {h.assignedUser.prenom} {h.assignedUser.nom}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-xs"
                      onClick={() => setEditingHeadset(h)}
                    >
                      <RefreshCw className="size-3" aria-hidden="true" />
                      Changer le statut
                    </Button>
                    {!h.assignedUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={() => setAssigningHeadset(h)}
                      >
                        <UserPlus className="size-3" aria-hidden="true" />
                        Assigner à un utilisateur
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
