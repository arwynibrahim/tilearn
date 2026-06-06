'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usersApi } from '@/lib/api/users';
import { formatDate } from '@/lib/utils';
import type { Role } from '@/types';

const ROLE_VARIANT: Record<Role, 'default' | 'secondary' | 'info' | 'warning'> = {
  LEARNER: 'default',
  INSTRUCTOR: 'info',
  ADMIN_INSTITUTION: 'warning',
  SUPER_ADMIN: 'secondary',
};

const ROLE_LABELS: Record<Role, string> = {
  LEARNER: 'Apprenant',
  INSTRUCTOR: 'Instructeur',
  ADMIN_INSTITUTION: 'Admin Institution',
  SUPER_ADMIN: 'Super Admin',
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list', page],
    queryFn: () => usersApi.list(page, LIMIT),
    retry: false,
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users-list'] }),
  });

  const filtered = data?.data?.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }) ?? [];

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">
            {data?.total ?? 0} utilisateurs au total
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
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
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Utilisateur</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Rôle</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Inscrit le</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={ROLE_VARIANT[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={user.deletedAt ? 'destructive' : 'success'}>
                          {user.deletedAt ? 'Désactivé' : 'Actif'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="size-8 hover:bg-blue-50 hover:text-blue-600">
                            <UserCog className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
                                deleteMut.mutate(user.id);
                              }
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-400">
                Page {page} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
