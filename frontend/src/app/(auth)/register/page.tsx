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
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { PasswordInput } from '@/components/auth/password-input';
import { useRegister } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
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
          <PasswordInput
            id="password"
            placeholder="Minimum 8 caractères"
            {...field('password')}
            className={errors.password ? 'border-red-400' : ''}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
          <PasswordInput
            id="confirmPassword"
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
