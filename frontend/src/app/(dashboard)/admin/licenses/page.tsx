'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { b2bApi } from '@/lib/api/b2b';
import { formatDate } from '@/lib/utils';
import type { License, LicensePlan } from '@/types';

const PLAN_VARIANT: Record<LicensePlan, 'default' | 'info' | 'secondary'> = {
  STARTER: 'default',
  TEAM: 'info',
  ENTERPRISE: 'secondary',
};

function LicenseCard({ license }: { license: License }) {
  const isExpired = new Date(license.expiresAt) < new Date();
  const usagePercent = license.seats > 0 ? Math.round((license.usedSeats / license.seats) * 100) : 0;

  return (
    <Card className={`card-hover ${isExpired ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <BadgeCheck className="size-5 text-brand" />
          </div>
          <div className="flex gap-2">
            <Badge variant={PLAN_VARIANT[license.plan]}>{license.plan}</Badge>
            {isExpired && <Badge variant="destructive">Expirée</Badge>}
          </div>
        </div>

        {license.organization && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {license.organization.name}
          </p>
        )}

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-600">Sièges utilisés</span>
            <span className="font-semibold text-gray-900">{license.usedSeats} / {license.seats}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-brand'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 90 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="size-3" />
              Capacité presque atteinte
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
          <span>Créée le {formatDate(license.createdAt)}</span>
          <span className={isExpired ? 'text-red-400' : ''}>
            Expire: {formatDate(license.expiresAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LicensesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const { data: orgs = [] } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: b2bApi.organizations.list,
    retry: false,
  });

  const firstOrgId = selectedOrgId ?? orgs[0]?.id;

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ['admin-licenses', firstOrgId],
    queryFn: () => b2bApi.licenses.listByOrg(firstOrgId!),
    enabled: !!firstOrgId,
    retry: false,
  });

  const active = licenses.filter((l) => new Date(l.expiresAt) >= new Date()).length;
  const expired = licenses.length - active;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Licences</h1>
        <p className="text-sm text-gray-500">
          {active} active(s) · {expired} expirée(s)
        </p>
      </div>

      {/* Org selector */}
      {orgs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                (selectedOrgId ?? orgs[0]?.id) === org.id
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BadgeCheck className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">Aucune licence pour cette organisation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {licenses.map((license) => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>
      )}
    </div>
  );
}
