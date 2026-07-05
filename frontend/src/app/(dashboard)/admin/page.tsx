'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BadgeCheck, Headphones } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { b2bApi } from '@/lib/api/b2b';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import { hasPlatformRole, getPrimaryRole } from '@/types';
import { PageHeader, StatsCard, StatsCardSkeleton, SectionCard, SectionCardSkeleton, UserListItem, ROLE_VARIANT, ROLE_LABELS } from '@/components/dashboard';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const isSuperAdmin = hasPlatformRole(user ?? null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list(1, 5),
    retry: false,
  });

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => b2bApi.organizations.list(),
    retry: false,
  });

  const totalHeadsets = orgs?.reduce((sum, o) => sum + (o._count?.vrHeadsets ?? 0), 0) ?? 0;
  const totalLicenses = orgs?.reduce((sum, o) => sum + (o._count?.licenses ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description={isSuperAdmin ? "Vue d'ensemble de la plateforme" : (orgs?.[0]?.name ?? 'Mon organisation')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {usersLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              icon={Users}
              label={isSuperAdmin ? 'Utilisateurs totaux' : 'Utilisateurs'}
              value={users?.total ?? '-'}
              sub={isSuperAdmin ? 'apprenants & instructeurs' : 'de votre organisation'}
              colorClass="bg-stat-brand"
            />
            <StatsCard
              icon={Building2}
              label={isSuperAdmin ? 'Organisations' : 'Organisation'}
              value={isSuperAdmin ? (orgs?.length ?? '-') : (orgs?.[0]?.name ?? '-')}
              sub={orgs?.[0]?.type ?? ''}
              colorClass="bg-stat-blue"
            />
            <StatsCard
              icon={BadgeCheck}
              label="Licences"
              value={totalLicenses ?? '-'}
              sub={isSuperAdmin ? 'toutes organisations' : 'de votre organisation'}
              colorClass="bg-stat-green"
            />
            <StatsCard
              icon={Headphones}
              label="Casques VR"
              value={totalHeadsets ?? '-'}
              sub={isSuperAdmin ? 'parc total' : 'de votre organisation'}
              colorClass="bg-stat-purple"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={Users} title={isSuperAdmin ? 'Utilisateurs récents' : 'Utilisateurs de l\'organisation'}>
          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton size-9 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3.5 w-2/5" />
                    <div className="skeleton h-3 w-3/5" />
                  </div>
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : users?.data?.length ? (
            <div className="divide-y divide-gray-50">
              {users.data.map((u) => {
                const role = getPrimaryRole(u);
                return (
                  <UserListItem
                    key={u.id}
                    prenom={u.prenom}
                    nom={u.nom}
                    email={u.email}
                    badge={role ? { label: ROLE_LABELS[role] ?? role, variant: ROLE_VARIANT[role] ?? 'default' } : undefined}
                    date={formatDate(u.createdAt)}
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</p>
          )}
        </SectionCard>

        <SectionCard icon={Building2} title={isSuperAdmin ? 'Organisations' : 'Mon organisation'}>
          {orgsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton size-9 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3.5 w-2/5" />
                    <div className="skeleton h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : orgs?.length ? (
            <div className="divide-y divide-gray-50">
              {orgs.slice(0, 6).map((o) => (
                <a
                  key={o.id}
                  href="/admin/organizations"
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-3 -mx-2 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-navy/10">
                      <Building2 className="size-4 text-navy" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{o.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck className="size-3" />
                      {o._count?.licenses ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Headphones className="size-3" />
                      {o._count?.vrHeadsets ?? 0}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">Aucune organisation.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
