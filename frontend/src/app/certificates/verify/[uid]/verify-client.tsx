'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Award, BookOpen, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { learningApi } from '@/lib/api/learning';
import { formatDate } from '@/lib/utils';

export default function CertificateVerifyClient({ uid }: { uid: string }) {
  const { data: cert, isLoading, isError } = useQuery({
    queryKey: ['verify-cert', uid],
    queryFn: () => learningApi.certificates.verify(uid),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {isLoading ? (
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-gray-200" />
              <p className="text-gray-400">Vérification en cours...</p>
            </div>
          ) : isError || !cert?.valid ? (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <XCircle className="size-10 text-red-500" />
              </div>
              <h1 className="mb-2 text-2xl font-black text-gray-900">Certificat invalide</h1>
              <p className="mb-6 text-gray-500 text-sm">
                Ce certificat est introuvable, révoqué, ou le lien est incorrect.
              </p>
              <Link href="/">
                <Button variant="outline">Retour à l&apos;accueil</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand/10 to-brand/5 px-8 py-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <Award className="size-10 text-brand" />
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-5 text-green-500" />
                  <span className="font-bold text-green-600">Certificat valide</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900">Certificat de réussite</h1>
                <p className="mt-1 text-sm text-gray-500">Total Innovation Learning</p>
              </div>

              {/* Details */}
              <div className="divide-y divide-gray-50 px-8 py-4">
                {(cert as unknown as { user?: { prenom: string; nom: string } }).user && (
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                      <User className="size-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Titulaire</p>
                      <p className="font-semibold text-gray-900">
                        {(cert as unknown as { user: { prenom: string; nom: string } }).user.prenom}{' '}
                        {(cert as unknown as { user: { prenom: string; nom: string } }).user.nom}
                      </p>
                    </div>
                  </div>
                )}

                {cert.course && (
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10">
                      <BookOpen className="size-5 text-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Formation</p>
                      <p className="font-semibold text-gray-900">{cert.course.title}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <Calendar className="size-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Délivré le</p>
                    <p className="font-semibold text-gray-900">{formatDate(cert.issuedAt)}</p>
                  </div>
                </div>

                <div className="py-4">
                  <p className="mb-1 text-xs text-gray-400">Identifiant unique</p>
                  <p className="font-mono text-xs text-gray-600 break-all">{cert.certificateUid}</p>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-4 text-center">
                <p className="text-xs text-gray-400">
                  Ce certificat a été délivré par Total Innovation Learning et est vérifiable à tout moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
