'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Building2, BadgeCheck, Headphones, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api/users';
import { b2bApi } from '@/lib/api/b2b';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';

function StatCard({
  icon: Icon, title, value, sub, color,
}: {
  icon: React.ElementType; title: string; value: string | number; sub?: string; color: string;
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
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

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

  const totalHeadsets = orgs?.reduce((sum, o) => sum + (o._count?.vrHeadsets ?? 0), 0);
  const totalLicenses = orgs?.reduce((sum, o) => sum + (o._count?.licenses ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">
          {isSuperAdmin ? "Vue d'ensemble de la plateforme" : (orgs?.[0]?.name ?? 'Mon organisation')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title={isSuperAdmin ? 'Utilisateurs totaux' : 'Utilisateurs'}
          value={users?.total ?? '-'}
          sub={isSuperAdmin ? 'apprenants & instructeurs' : 'de votre organisation'}
          color="bg-brand"
        />
        <StatCard
          icon={Building2}
          title={isSuperAdmin ? 'Organisations' : 'Organisation'}
          value={isSuperAdmin ? (orgs?.length ?? '-') : (orgs?.[0]?.name ?? '-')}
          sub={isSuperAdmin ? 'institutions partenaires' : (orgs?.[0]?.type ?? '')}
          color="bg-blue-500"
        />
        <StatCard
          icon={BadgeCheck}
          title="Licences"
          value={totalLicenses ?? '-'}
          sub={isSuperAdmin ? 'toutes organisations' : 'de votre organisation'}
          color="bg-green-500"
        />
        <StatCard
          icon={Headphones}
          title="Casques VR"
          value={totalHeadsets ?? '-'}
          sub={isSuperAdmin ? 'parc total' : 'de votre organisation'}
          color="bg-purple-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-brand" />
              {isSuperAdmin ? 'Utilisateurs récents' : 'Utilisateurs de l\'organisation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users?.data?.length ? (
              <div className="divide-y divide-gray-50">
                {users.data.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {u.prenom} {u.nom}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-brand" />
              {isSuperAdmin ? 'Organisations' : 'Mon organisation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orgs?.length ? (
              <div className="divide-y divide-gray-50">
                {orgs.slice(0, 6).map((o) => (
                  <Link
                    key={o.id}
                    href="/admin/organizations"
                    className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/10">
                        <Building2 className="size-4 text-navy" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{o.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <BadgeCheck className="size-3" />
                        {o._count?.licenses ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Headphones className="size-3" />
                        {o._count?.vrHeadsets ?? 0}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">Aucune organisation.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
