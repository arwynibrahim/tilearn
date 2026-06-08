import { Suspense } from 'react';
import type { Metadata } from 'next';
import CertificateVerifyClient from './verify-client';

export const metadata: Metadata = {
  title: 'Vérification de certificat',
  description: 'Vérifiez l\'authenticité d\'un certificat Total Innovation Learning.',
};

export default function VerifyPage({ params }: { params: { uid: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Vérification...</div>}>
      <CertificateVerifyClient uid={params.uid} />
    </Suspense>
  );
}
