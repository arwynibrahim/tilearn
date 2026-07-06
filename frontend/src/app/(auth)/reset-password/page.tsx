'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';
import { useT } from '@/hooks/use-t';
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
  const t = useT();
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
    if (!token) { setError(t('auth.reset_invalid_or_expired')); return; }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.reset_invalid_or_expired')));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-gray-500">{t('auth.reset_invalid_link')}</p>
        <Link href="/forgot-password"><Button variant="outline">{t('auth.reset_request_new_link')}</Button></Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle2 className="size-8 text-green-500" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-gray-900">{t('auth.reset_success_title')}</h1>
        <p className="text-sm text-gray-500">{t('auth.reset_success_subtitle')}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('auth.back_to_login')}
      </Link>

      <h1 className="mb-1 text-2xl font-black text-gray-900">{t('auth.reset_title')}</h1>
      <p className="mb-8 text-sm text-gray-500">{t('auth.reset_subtitle')}</p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.reset_new_password')}</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-red-400' : ''}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">{t('auth.confirm_password')}</Label>
          <PasswordInput
            id="confirm"
            placeholder="••••••••"
            {...register('confirm')}
            className={errors.confirm ? 'border-red-400' : ''}
          />
          {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {loading ? t('auth.reset_updating') : t('auth.reset_cta')}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-gray-400">{t('auth.loading')}</div>}>
      <ResetForm />
    </Suspense>
  );
}
