'use client';

import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { learningApi } from '@/lib/api/learning';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: learningApi.certificates.list,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mes certificats</h1>
        <p className="text-sm text-gray-500">{certificates.length} certificat(s) obtenu(s)</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Chargement...</div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BadgeCheck className="mx-auto mb-3 size-12 text-gray-200" />
            <p className="text-gray-400">
              Aucun certificat pour l&apos;instant. Terminez un cours pour en obtenir un.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="card-hover overflow-hidden">
              <div className="h-1.5 bg-brand-gradient" />
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                    <ShieldCheck className="size-6 text-brand" />
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Vérifié
                  </span>
                </div>

                <h3 className="mb-1 font-bold text-gray-900">{cert.course?.title ?? 'Cours'}</h3>
                <p className="mb-1 text-xs text-gray-400">
                  Délivré le {formatDate(cert.issuedAt)}
                </p>
                <p className="mb-4 font-mono text-xs text-gray-400">UID: {cert.certificateUid}</p>

                <div className="flex gap-2">
                  {cert.verificationUrl && (
                    <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="size-3.5" />
                        Vérifier
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => alert('Téléchargement PDF à venir')}
                  >
                    <Download className="size-3.5" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
