'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Clock, CheckCircle, XCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/status';
import { paymentApi } from '@/lib/api/payment';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { PaymentStatus } from '@/types';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info'; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', variant: 'warning', icon: Clock },
  SUCCESS: { label: 'Réussi', variant: 'success', icon: CheckCircle },
  FAILED: { label: 'Échoué', variant: 'destructive', icon: XCircle },
  REFUNDED: { label: 'Remboursé', variant: 'info', icon: RefreshCw },
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () => paymentApi.payments.listAll(page, LIMIT),
    retry: false,
  });

  const payments = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.transactionId?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.user?.nom?.toLowerCase().includes(q) ||
      p.user?.prenom?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Paiements</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} transactions · {formatCurrency(totalRevenue)} de revenus</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
              <Input
                placeholder="Rechercher par référence, email, nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Rechercher un paiement"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <div role="status" className="py-12 text-center">
              <CreditCard className="mx-auto mb-3 size-12 text-gray-200" aria-hidden="true" />
              <p className="text-gray-400">Aucun paiement trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Historique des paiements">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Utilisateur</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Montant</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Fournisseur</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Méthode</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Référence</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => {
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          {p.user ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand" aria-hidden="true">
                                {p.user.prenom?.[0]}{p.user.nom?.[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.user.prenom} {p.user.nom}</p>
                                <p className="text-xs text-gray-400">{p.user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(p.amount, p.currency)}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant="secondary">{p.provider}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{p.method?.replace('_', ' ') ?? '-'}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.transactionId?.slice(0, 12)}...</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={cfg.variant} className="gap-1">
                            <cfg.icon className="size-3" aria-hidden="true" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(p.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-400">Page {page} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Page précédente">
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Page suivante">
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
