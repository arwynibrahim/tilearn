'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

const INTEREST_KEYS = [
  'interests_dev',
  'interests_health',
  'interests_agro',
  'interests_business',
  'interests_creative',
  'interests_language',
  'interests_science',
  'interests_tech',
] as const;

const schema = z
  .object({
    prenom: z.string().min(2, 'Prénom requis'),
    nom: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useT();
  const { mutate: register, isPending, error } = useRegister();
  const [interests, setInterests] = useState<string[]>([]);

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };

  const onSubmit = ({ confirmPassword: _, ...data }: FormData) =>
    register({ ...data, interests });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black text-gray-900">{t('auth.register_title')}</h1>
      <p className="mb-8 text-gray-500">{t('auth.register_subtitle')}</p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {getApiErrorMessage(error, t('auth.error_exists'))}
        </div>
      )}

      {/* OAuth */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <a href={authApi.googleAuthUrl()}>
          <Button variant="outline" className="w-full gap-2" type="button">
            <svg className="size-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </Button>
        </a>
        <a href={authApi.linkedinAuthUrl()}>
          <Button variant="outline" className="w-full gap-2" type="button">
            <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {t('auth.linkedin')}
          </Button>
        </a>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">{t('auth.or_continue')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <Sparkles size={16} className="shrink-0" />
          <span>{t('auth.register_as_learner_info')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="prenom">{t('auth.first_name')}</Label>
            <Input
              id="prenom"
              placeholder="Moussa"
              {...field('prenom')}
              className={errors.prenom ? 'border-red-400' : ''}
            />
            {errors.prenom && <p className="text-xs text-red-500">{errors.prenom.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nom">{t('auth.last_name')}</Label>
            <Input
              id="nom"
              placeholder="Traoré"
              {...field('nom')}
              className={errors.nom ? 'border-red-400' : ''}
            />
            {errors.nom && <p className="text-xs text-red-500">{errors.nom.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            {...field('email')}
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 caractères"
            {...field('password')}
            className={errors.password ? 'border-red-400' : ''}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...field('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-400' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('auth.interests_label')}</Label>
          <p className="text-xs text-gray-400">{t('auth.interests_subtitle')}</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_KEYS.map((key) => {
              const selected = interests.includes(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selected
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t(`auth.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isPending}>
          {isPending ? t('auth.registering') : t('auth.sign_up')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t('auth.have_account')}{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {t('auth.sign_in')}
        </Link>
      </p>
    </div>
  );
}
