'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Clock, CheckCircle, XCircle, RefreshCw, ArrowUpRight, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/lib/api/payment';
import { formatDate, formatCurrency } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';
import type { PaymentStatus, SubscriptionPlan } from '@/types';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info'; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', variant: 'warning', icon: Clock },
  SUCCESS: { label: 'Réussi', variant: 'success', icon: CheckCircle },
  FAILED: { label: 'Échoué', variant: 'destructive', icon: XCircle },
  REFUNDED: { label: 'Remboursé', variant: 'info', icon: RefreshCw },
};

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREEMIUM: 'Freemium',
  STARTER: 'Starter',
  PRO: 'Pro',
  EXPERT: 'Expert',
};

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FREEMIUM: 0,
  STARTER: 5000,
  PRO: 15000,
  EXPERT: 35000,
};

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createSub = useMutation({
    mutationFn: (plan: SubscriptionPlan) => paymentApi.subscriptions.create(plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-subscriptions'] });
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Erreur lors de la souscription.")),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Choisir un abonnement</h2>
          <p className="text-sm text-gray-500">Sélectionnez le plan qui vous convient</p>
        </div>
        <div className="p-6 space-y-3">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}
          {(Object.keys(PLAN_LABELS) as SubscriptionPlan[]).filter((p) => p !== 'FREEMIUM').map((plan) => (
            <button
              key={plan}
              disabled={createSub.isPending}
              onClick={() => createSub.mutate(plan)}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-brand hover:bg-brand/5 disabled:opacity-50"
            >
              <div>
                <p className="font-semibold text-gray-900">{PLAN_LABELS[plan]}</p>
                <p className="text-sm text-gray-500">
                  {plan === 'STARTER' && 'Accès aux cours de base'}
                  {plan === 'PRO' && 'Cours avancés + VR'}
                  {plan === 'EXPERT' && 'Tout illimité + support prioritaire'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-brand">{formatCurrency(PLAN_PRICES[plan])}</p>
                <p className="text-xs text-gray-400">/mois</p>
              </div>
            </button>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [showSubscribe, setShowSubscribe] = useState(false);

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['my-payments'],
    queryFn: paymentApi.payments.listMine,
    retry: false,
  });

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: paymentApi.subscriptions.listMine,
    retry: false,
  });

  const activeSub = subscriptions.find((s) => s.status === 'active' || s.status === 'ACTIVE');
  const totalSpent = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {showSubscribe && <SubscribeModal onClose={() => setShowSubscribe(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mes paiements</h1>
          <p className="text-sm text-gray-500">Historique des paiements et abonnements</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowSubscribe(true)}>
          <Zap className="size-4" />
          S&apos;abonner
        </Button>
      </div>

      {/* Subscription card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4 text-brand" />
            Abonnement actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubs ? (
            <div className="py-6 text-center text-sm text-gray-400">Chargement...</div>
          ) : activeSub ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{PLAN_LABELS[activeSub.plan as SubscriptionPlan] ?? activeSub.plan}</p>
                <p className="text-sm text-gray-500">
                  Du {formatDate(activeSub.currentPeriodStart)} au {formatDate(activeSub.currentPeriodEnd)}
                </p>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-3">Aucun abonnement actif</p>
              <Button size="sm" onClick={() => setShowSubscribe(true)}>Choisir un plan</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-brand p-3">
              <CreditCard className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total dépensé</p>
              <p className="text-2xl font-black text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-green-500 p-3">
              <CheckCircle className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paiements réussis</p>
              <p className="text-2xl font-black text-gray-900">{payments.filter((p) => p.status === 'SUCCESS').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-amber-500 p-3">
              <Clock className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-black text-gray-900">{payments.filter((p) => p.status === 'PENDING').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPayments ? (
            <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto mb-3 size-12 text-gray-200" />
              <p className="text-gray-400">Aucun paiement pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Montant</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Méthode</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Référence</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => {
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-600">{formatDate(p.createdAt)}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(p.amount, p.currency)}</td>
                        <td className="px-5 py-3.5 text-gray-600">{p.method?.replace('_', ' ') ?? '—'}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.transactionId?.slice(0, 16)}...</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={cfg.variant} className="gap-1">
                            <cfg.icon className="size-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
