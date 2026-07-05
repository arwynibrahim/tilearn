'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BadgeCheck, Headphones, Shield, UserCheck, Library, CreditCard } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { b2bApi } from '@/lib/api/b2b';
import { formatDate } from '@/lib/utils';
import { getPrimaryRole } from '@/types';
import { PageHeader, StatsCard, StatsCardSkeleton, SectionCard, SectionCardSkeleton, QuickLinkCard, UserListItem, RoleBadge, ROLE_VARIANT, ROLE_LABELS } from '@/components/dashboard';

const QUICK_LINKS = [
  { href: '/super-admin/users', icon: Users, title: 'Utilisateurs', description: 'Gérer tous les comptes', color: 'bg-brand/10 text-brand' },
  { href: '/super-admin/organizations', icon: Building2, title: 'Organisations', description: 'Créer et gérer les institutions', color: 'bg-blue-50 text-blue-600' },
  { href: '/super-admin/instructors', icon: UserCheck, title: 'Instructeurs', description: 'Vérifier les formateurs', color: 'bg-green-50 text-green-600' },
  { href: '/super-admin/roles', icon: Shield, title: 'Rôles & Permissions', description: 'Gérer les accès', color: 'bg-purple-50 text-purple-600' },
  { href: '/admin/catalogue', icon: Library, title: 'Catalogue', description: 'Gérer les cours et domaines', color: 'bg-amber-50 text-amber-600' },
  { href: '/admin/licenses', icon: BadgeCheck, title: 'Licences', description: 'Toutes les licences', color: 'bg-green-50 text-green-600' },
];

export default function SuperAdminDashboard() {
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
        title="Super Administration"
        description="Vue d'ensemble de la plateforme"
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
            <StatsCard icon={Users} label="Utilisateurs totaux" value={users?.total ?? '-'} sub="apprenants & instructeurs" colorClass="bg-stat-brand" />
            <StatsCard icon={Building2} label="Organisations" value={orgs?.length ?? '-'} sub="institutions partenaires" colorClass="bg-stat-blue" />
            <StatsCard icon={BadgeCheck} label="Licences" value={totalLicenses} sub="toutes organisations" colorClass="bg-stat-green" />
            <StatsCard icon={Headphones} label="Casques VR" value={totalHeadsets} sub="parc total" colorClass="bg-stat-purple" />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <QuickLinkCard key={link.href} {...link} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={Users} title="Utilisateurs récents">
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

        <SectionCard icon={Building2} title="Organisations">
          {orgsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton size-9 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3.5 w-2/5" />
                    <div className="skeleton h-3 w-3/5" />
                  </div>
                  <div className="skeleton h-4 w-16" />
                </div>
              ))}
            </div>
          ) : orgs?.length ? (
            <div className="divide-y divide-gray-50">
              {orgs.slice(0, 6).map((o) => (
                <a
                  key={o.id}
                  href="/super-admin/organizations"
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
