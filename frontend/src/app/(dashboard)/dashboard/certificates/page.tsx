'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Download, ExternalLink, ShieldCheck, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { learningApi } from '@/lib/api/learning';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api/client';

function GenerateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningApi.enrollments.list,
    retry: false,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: learningApi.certificates.list,
    retry: false,
  });

  const completedEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
  const certCourseIds = new Set(certificates.map((c) => c.courseId));
  const eligible = completedEnrollments.filter((e) => !certCourseIds.has(e.courseId));

  const generateMut = useMutation({
    mutationFn: (courseId: string) => learningApi.certificates.generate(courseId),
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['my-certificates'] });
      setTimeout(() => onClose(), 1500);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Erreur lors de la génération.')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-bold text-gray-900">Générer un certificat</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><X className="size-4 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-600">
              Certificat généré avec succès !
            </div>
          )}

          {loadingEnrollments ? (
            <div className="py-6 text-center text-sm text-gray-400">Chargement...</div>
          ) : eligible.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              Aucun cours éligible. Terminez un cours pour générer un certificat.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eligible.map((e) => (
                <button
                  key={e.courseId}
                  type="button"
                  disabled={generateMut.isPending || success}
                  onClick={() => { setError(null); generateMut.mutate(e.courseId); }}
                  className="w-full flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-3 text-left text-sm hover:border-brand/30 hover:bg-brand/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                    <ShieldCheck className="size-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{e.course?.title ?? 'Cours'}</p>
                    <p className="text-xs text-gray-400">Inscrit le {formatDate(e.enrolledAt)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">Générer</Badge>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const [showGenerate, setShowGenerate] = useState(false);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: learningApi.certificates.list,
    retry: false,
  });

  return (
    <div className="space-y-6">
      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mes certificats</h1>
          <p className="text-sm text-gray-500">{certificates.length} certificat(s) obtenu(s)</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowGenerate(true)}>
          <Plus className="size-4" />
          Générer un certificat
        </Button>
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
