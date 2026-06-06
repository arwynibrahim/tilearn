'use client';

import { useQuery } from '@tanstack/react-query';
import { Headphones, Battery, Wifi, WifiOff, Zap, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mdmApi } from '@/lib/api/mdm';
import { formatDate } from '@/lib/utils';
import type { HeadsetStatus, HeadsetModel } from '@/types';

const STATUS_CONFIG: Record<HeadsetStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info'; icon: React.ElementType }> = {
  ONLINE: { label: 'En ligne', variant: 'success', icon: Wifi },
  OFFLINE: { label: 'Hors ligne', variant: 'destructive', icon: WifiOff },
  CHARGING: { label: 'En charge', variant: 'warning', icon: Zap },
  MAINTENANCE: { label: 'Maintenance', variant: 'info', icon: Wrench },
};

const MODEL_LABELS: Record<HeadsetModel, string> = {
  META_QUEST_2: 'Meta Quest 2',
  META_QUEST_3: 'Meta Quest 3',
  PICO_4: 'Pico 4',
};

export default function MdmPage() {
  const { data: headsets = [], isLoading } = useQuery({
    queryKey: ['admin-headsets'],
    queryFn: mdmApi.headsets.list,
    retry: false,
    refetchInterval: 30_000, // refresh every 30s
  });

  const byStatus = (s: HeadsetStatus) => headsets.filter((h) => h.status === s).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Parc VR — MDM</h1>
        <p className="text-sm text-gray-500">Gestion de la flotte de casques VR</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.keys(STATUS_CONFIG) as HeadsetStatus[]).map((s) => {
          const config = STATUS_CONFIG[s];
          return (
            <Card key={s}>
              <CardContent className="flex items-center gap-3 p-4">
                <config.icon className="size-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{config.label}</p>
                  <p className="text-2xl font-black text-gray-900">{byStatus(s)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Headsets grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : headsets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Headphones className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">Aucun casque enregistré.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {headsets.map((h) => {
            const config = STATUS_CONFIG[h.status];
            const batteryColor =
              h.batteryLevel >= 60
                ? 'text-green-500'
                : h.batteryLevel >= 30
                ? 'text-amber-500'
                : 'text-red-500';

            return (
              <Card key={h.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
                      <Headphones className="size-5 text-navy" />
                    </div>
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      <config.icon className="size-3" />
                      {config.label}
                    </Badge>
                  </div>

                  <p className="font-semibold text-gray-900">{MODEL_LABELS[h.model]}</p>
                  <p className="mb-3 text-xs font-mono text-gray-400">{h.serial}</p>

                  {/* Battery */}
                  <div className="mb-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Battery className="size-3" />
                        Batterie
                      </span>
                      <span className={`font-semibold ${batteryColor}`}>{h.batteryLevel}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${h.batteryLevel >= 60 ? 'bg-green-500' : h.batteryLevel >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${h.batteryLevel}%` }}
                      />
                    </div>
                  </div>

                  {h.lastSeenAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      Vu: {formatDate(h.lastSeenAt)}
                    </p>
                  )}

                  {h.organization && (
                    <p className="mt-1 text-xs text-gray-400 truncate">{h.organization.name}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
