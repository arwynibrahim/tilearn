'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Building2, BadgeCheck, Headphones, Activity, Shield, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api/users';
import { b2bApi } from '@/lib/api/b2b';
import { formatDate } from '@/lib/utils';
import { getPrimaryRole } from '@/types';

const ROLE_VARIANT = {
  LEARNER: 'default', CREATOR: 'info', MANAGER: 'warning', ADMIN: 'warning', SUPER_ADMIN: 'secondary',
} as const;
const ROLE_LABELS = {
  LEARNER: 'Apprenant', CREATOR: 'Formateur', MANAGER: 'Manager', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
} as const;

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

export default function SuperAdminDashboard() {
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
        <h1 className="text-2xl font-black text-gray-900">Super Administration</h1>
        <p className="text-sm text-gray-500">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Utilisateurs totaux" value={users?.total ?? '-'} sub="apprenants & instructeurs" color="bg-brand" />
        <StatCard icon={Building2} title="Organisations" value={orgs?.length ?? '-'} sub="institutions partenaires" color="bg-blue-500" />
        <StatCard icon={BadgeCheck} title="Licences" value={totalLicenses ?? '-'} sub="toutes organisations" color="bg-green-500" />
        <StatCard icon={Headphones} title="Casques VR" value={totalHeadsets ?? '-'} sub="parc total" color="bg-purple-500" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/super-admin/users" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-brand/10 p-3 group-hover:bg-brand/20 transition-colors">
                <Users className="size-6 text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Utilisateurs</p>
                <p className="text-xs text-gray-400">Gérer tous les comptes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/super-admin/organizations" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                <Building2 className="size-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Organisations</p>
                <p className="text-xs text-gray-400">Créer et gérer les institutions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/super-admin/instructors" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-green-500/10 p-3 group-hover:bg-green-500/20 transition-colors">
                <UserCheck className="size-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Instructeurs</p>
                <p className="text-xs text-gray-400">Vérifier les formateurs</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/super-admin/roles" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                <Shield className="size-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Rôles & Permissions</p>
                <p className="text-xs text-gray-400">Gérer les accès</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/catalogue" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-amber-500/10 p-3 group-hover:bg-amber-500/20 transition-colors">
                <Activity className="size-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Catalogue</p>
                <p className="text-xs text-gray-400">Gérer les cours</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/licenses" className="group">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-green-500/10 p-3 group-hover:bg-green-500/20 transition-colors">
                <BadgeCheck className="size-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Licences</p>
                <p className="text-xs text-gray-400">Toutes les licences</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.prenom} {u.nom}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(() => { const r = getPrimaryRole(u); return r ? <Badge variant={ROLE_VARIANT[r]}>{ROLE_LABELS[r]}</Badge> : <Badge variant="default">—</Badge>; })()}
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
              Organisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orgs?.length ? (
              <div className="divide-y divide-gray-50">
                {orgs.slice(0, 6).map((o) => (
                  <Link
                    key={o.id}
                    href="/super-admin/organizations"
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
