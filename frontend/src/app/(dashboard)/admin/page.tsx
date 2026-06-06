'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BadgeCheck, Headphones, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api/users';
import { b2bApi } from '@/lib/api/b2b';
import { mdmApi } from '@/lib/api/mdm';
import { formatDate } from '@/lib/utils';

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-2xl p-3 ${color}`}>
          <Icon className="size-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list(1, 5),
    retry: false,
  });

  const { data: orgs } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => b2bApi.organizations.list(),
    retry: false,
  });

  const { data: headsets } = useQuery({
    queryKey: ['admin-headsets'],
    queryFn: () => mdmApi.headsets.list(),
    retry: false,
  });

  const onlineHeadsets = headsets?.filter((h) => h.status === 'ONLINE').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Utilisateurs totaux"
          value={users?.total ?? '—'}
          sub="apprenants & instructeurs"
          color="bg-brand"
        />
        <StatCard
          icon={Building2}
          title="Organisations"
          value={orgs?.length ?? '—'}
          sub="institutions partenaires"
          color="bg-blue-500"
        />
        <StatCard
          icon={BadgeCheck}
          title="Licences actives"
          value="—"
          sub="en cours de validité"
          color="bg-green-500"
        />
        <StatCard
          icon={Headphones}
          title="Casques VR"
          value={headsets?.length ?? '—'}
          sub={`${onlineHeadsets} en ligne`}
          color="bg-purple-500"
        />
      </div>

      {/* Recent users + Headset status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-brand" />
              Utilisateurs récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users?.data?.length ? (
              <div className="divide-y divide-gray-50">
                {users.data.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={u.role === 'SUPER_ADMIN' ? 'secondary' : u.role === 'INSTRUCTOR' ? 'info' : 'default'}>
                        {u.role}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</p>
            )}
          </CardContent>
        </Card>

        {/* Headset status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-brand" />
              Parc VR — Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            {headsets?.length ? (
              <div className="space-y-3">
                {[
                  { status: 'ONLINE', label: 'En ligne', color: 'bg-green-500', count: headsets.filter(h => h.status === 'ONLINE').length },
                  { status: 'OFFLINE', label: 'Hors ligne', color: 'bg-gray-400', count: headsets.filter(h => h.status === 'OFFLINE').length },
                  { status: 'CHARGING', label: 'En charge', color: 'bg-amber-500', count: headsets.filter(h => h.status === 'CHARGING').length },
                  { status: 'MAINTENANCE', label: 'Maintenance', color: 'bg-red-500', count: headsets.filter(h => h.status === 'MAINTENANCE').length },
                ].map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="flex-1 text-sm text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-900">{s.count}</span>
                    <div className="h-1.5 w-24 rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${headsets.length ? (s.count / headsets.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Aucun casque enregistré.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
