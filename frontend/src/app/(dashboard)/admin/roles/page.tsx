'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, RefreshCw, Search, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { rolesApi } from '@/lib/api/roles';
import { usersApi } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/client';
import type { GroupedPermissions, UserWithPermissions, Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  LEARNER: 'Apprenant',
  INSTRUCTOR: 'Instructeur',
  ADMIN_INSTITUTION: 'Admin Institution',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_VARIANT: Record<Role, 'default' | 'secondary' | 'info' | 'warning'> = {
  LEARNER: 'default',
  INSTRUCTOR: 'info',
  ADMIN_INSTITUTION: 'warning',
  SUPER_ADMIN: 'secondary',
};

function PermissionsViewer({ grouped, onClose }: { grouped: GroupedPermissions; onClose: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h2 className="font-bold text-gray-900">Toutes les permissions</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <span className="text-gray-500">&times;</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {Object.entries(grouped).map(([group, perms]) => (
            <div key={group} className="rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-brand" />
                  <span className="font-semibold text-gray-900 text-sm">{group}</span>
                  <Badge variant="secondary" className="text-xs">{perms.length}</Badge>
                </div>
                {expandedGroup === group ? <ChevronDown className="size-4 text-gray-400" /> : <ChevronRight className="size-4 text-gray-400" />}
              </button>
              {expandedGroup === group && (
                <div className="border-t border-gray-50 px-4 py-2 space-y-1">
                  {perms.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t px-6 py-3 shrink-0">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

function UserPermissionsModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: userPerms, isLoading } = useQuery({
    queryKey: ['role-user-perms', userId],
    queryFn: () => rolesApi.user.get(userId),
    retry: false,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Permissions utilisateur</h2>
            {userPerms && (
              <p className="text-sm text-gray-500">{userPerms.prenom} {userPerms.nom}</p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <span className="text-gray-500">&times;</span>
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-400">Chargement...</div>
          ) : userPerms ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rôle:</span>
                <Badge variant={ROLE_VARIANT[userPerms.role as Role] ?? 'secondary'}>
                  {ROLE_LABELS[userPerms.role as Role] ?? userPerms.role}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Permissions ({userPerms.permissions.length})</p>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                  {userPerms.permissions.length > 0 ? (
                    userPerms.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Aucune permission spécifique</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Impossible de charger les permissions.</p>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const [showPermissions, setShowPermissions] = useState(false);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: grouped, isLoading: loadingPerms } = useQuery({
    queryKey: ['roles-permissions'],
    queryFn: rolesApi.permissions.listAll,
    retry: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ['roles-users-list'],
    queryFn: () => usersApi.list(1, 100),
    retry: false,
  });

  const users = (usersData?.data ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const syncMut = useMutation({
    mutationFn: rolesApi.sync,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles-permissions'] }),
  });

  const totalPerms = grouped ? Object.values(grouped).reduce((sum, perms) => sum + perms.length, 0) : 0;
  const totalGroups = grouped ? Object.keys(grouped).length : 0;

  return (
    <div className="space-y-6">
      {showPermissions && grouped && <PermissionsViewer grouped={grouped} onClose={() => setShowPermissions(false)} />}
      {viewingUser && <UserPermissionsModal userId={viewingUser} onClose={() => setViewingUser(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rôles & Permissions</h1>
          <p className="text-sm text-gray-500">{totalPerms} permissions dans {totalGroups} groupes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPermissions(true)}>
            <Shield className="size-4" />
            Voir les permissions
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => syncMut.mutate()}
            loading={syncMut.isPending}
          >
            <RefreshCw className="size-4" />
            Sync rôles
          </Button>
        </div>
      </div>

      {/* Groups overview */}
      {grouped && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([group, perms]) => (
            <Card key={group} className="card-hover cursor-pointer" onClick={() => setShowPermissions(true)}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                    <Shield className="size-5 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{group}</p>
                    <p className="text-xs text-gray-400">{perms.length} permissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loadingPerms && <div className="py-12 text-center text-sm text-gray-400">Chargement des permissions...</div>}

      {/* Users with roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-brand" />
              Utilisateurs et rôles
            </CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-500">Utilisateur</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-500">Rôle</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => setViewingUser(u.id)}
                      >
                        <Shield className="size-3" />
                        Permissions
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
