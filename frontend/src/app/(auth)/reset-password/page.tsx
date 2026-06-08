'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });
type FormData = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }: FormData) => {
    if (!token) { setError('Lien invalide ou expiré.'); return; }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lien invalide ou expiré.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-gray-500">Lien de réinitialisation invalide.</p>
        <Link href="/forgot-password"><Button variant="outline">Demander un nouveau lien</Button></Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle2 className="size-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-gray-900">Mot de passe mis à jour !</h1>
        <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="size-4" />
        Retour à la connexion
      </Link>

      <h1 className="mb-1 text-2xl font-black text-gray-900">Nouveau mot de passe</h1>
      <p className="mb-8 text-sm text-gray-500">Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.</p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-red-400' : ''}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            {...register('confirm')}
            className={errors.confirm ? 'border-red-400' : ''}
          />
          {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-gray-400 text-sm">Chargement...</div>}>
      <ResetForm />
    </Suspense>
  );
}
