'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { PasswordInput } from '@/components/auth/password-input';
import { useLogin } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { getApiErrorMessage } from '@/lib/api/client';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => login(data);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black text-gray-900">{t('auth.login_title')}</h1>
      <p className="mb-8 text-gray-500">{t('auth.login_subtitle')}</p>

      {registered && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {t('auth.success_register')}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {getApiErrorMessage(error, t('auth.error_invalid'))}
        </div>
      )}

      <OAuthButtons />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">{t('auth.or_continue')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            {...register('email')}
            className={errors.email ? 'border-red-400 focus:border-red-400' : ''}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Link href="/forgot-password" className="text-xs text-brand hover:underline">
              {t('auth.forgot_password')}
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-red-400 focus:border-red-400' : ''}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isPending}>
          {isPending ? t('auth.logging_in') : t('auth.sign_in')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t('auth.no_account')}{' '}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          {t('auth.sign_up')}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="animate-pulse text-sm text-gray-400">{t('auth.loading')}</div>}>
      <LoginForm />
    </Suspense>
  );
}
