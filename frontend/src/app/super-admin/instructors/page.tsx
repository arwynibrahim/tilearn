'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/status';
import { usersApi } from '@/lib/api/users';
import type { User } from '@/types';

function InstructorCard({ user }: { user: User }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand" aria-hidden="true">
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900">{user.prenom} {user.nom}</h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <Badge variant="info">Instructeur</Badge>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 text-xs text-gray-400">
          <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
          {user.lastLoginAt && (
            <span>· Dernière connexion le {new Date(user.lastLoginAt).toLocaleDateString('fr-FR')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function InstructorsPage() {
  const [search, setSearch] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => usersApi.list(1, 200),
    retry: false,
  });

  const allUsers = usersData?.data ?? [];
  const instructors = allUsers.filter((u) => u.role === 'INSTRUCTOR');
  const filtered = instructors.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Instructeurs</h1>
        <p className="text-sm text-gray-500">{instructors.length} instructeur(s) enregistré(s)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Rechercher un instructeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Rechercher un instructeur"
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
            <p className="text-gray-400">
              {search ? 'Aucun instructeur trouvé pour cette recherche.' : 'Aucun instructeur enregistré.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <InstructorCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
