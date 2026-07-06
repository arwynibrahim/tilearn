'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/hooks/use-t';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

const schema = z.object({ email: z.string().email('Email invalide') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.forgot_error_generic')));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
          <Mail className="size-8 text-brand" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-gray-900">{t('auth.forgot_sent_title')}</h1>
        <p className="mb-6 text-sm text-gray-500">
          {t('auth.forgot_sent_prefix')}{' '}
          <span className="font-medium text-gray-700">{getValues('email')}</span>,{' '}
          {t('auth.forgot_sent_suffix')}
        </p>
        <Link href="/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('auth.back_to_login')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('auth.back_to_login')}
      </Link>

      <h1 className="mb-1 text-2xl font-black text-gray-900">{t('auth.forgot_title')}</h1>
      <p className="mb-8 text-sm text-gray-500">{t('auth.forgot_subtitle')}</p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            {...register('email')}
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {loading ? t('auth.forgot_sending') : t('auth.forgot_cta')}
        </Button>
      </form>
    </div>
  );
}
