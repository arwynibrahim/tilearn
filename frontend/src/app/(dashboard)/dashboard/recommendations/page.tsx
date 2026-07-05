'use client';

import { Sparkles, TrendingUp, Target, Lightbulb, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useProfile } from '@/hooks/use-auth';

const INTEREST_LABELS: Record<string, string> = {
  interests_dev: 'Développement',
  interests_health: 'Santé',
  interests_agro: 'Agriculture',
  interests_business: 'Business & Gestion',
  interests_creative: 'Arts & Créativité',
  interests_language: 'Langues',
  interests_science: 'Sciences',
  interests_tech: 'Technologie',
};

export default function RecommendationsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile();

  const interests = profile?.interests ?? user?.interests ?? [];

  const recommendations = [
    {
      title: 'Développement Web Fullstack',
      reason: 'Correspond à votre intérêt pour le Développement',
      level: 'Débutant',
      duration: '40h',
      match: 95,
    },
    {
      title: 'IA & Machine Learning',
      reason: 'Basé sur votre intérêt pour la Technologie',
      level: 'Intermédiaire',
      duration: '60h',
      match: 88,
    },
    {
      title: 'Gestion de Projet Agile',
      reason: 'Recommandé pour votre profil Business',
      level: 'Débutant',
      duration: '20h',
      match: 82,
    },
  ];

  const insights = [
    { icon: TrendingUp, label: 'Progression moyenne', value: '—' },
    { icon: Target, label: 'Objectifs suggérés', value: '3' },
    { icon: Lightbulb, label: 'Nouveaux cours', value: '12' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          Recommandations
        </h1>
        <p className="text-sm text-gray-500">
          Des suggestions personnalisées basées sur vos centres d&apos;intérêt et votre activité
        </p>
      </div>

      {interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-brand" />
              Vos centres d&apos;intérêt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interests.map((key) => (
                <Badge key={key} variant="default" className="text-sm">
                  {INTEREST_LABELS[key] ?? key}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {interests.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Sparkles className="mx-auto mb-3 size-10 text-gray-200" />
            <p className="mb-1 text-sm font-medium text-gray-600">
              Aucun centre d&apos;intérêt renseigné
            </p>
            <p className="mb-4 text-xs text-gray-400">
              Renseignez vos centres d&apos;intérêt dans votre profil pour recevoir des recommandations personnalisées.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/profile">Modifier mon profil</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {insights.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-brand/10 p-3">
                <s.icon className="size-6 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <BookOpen className="size-5 text-brand" />
          Cours recommandés pour vous
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((r) => (
            <Card key={r.title} className="relative overflow-hidden">
              <div className="absolute right-3 top-3">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                  {r.match}%
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <p className="text-xs text-gray-400">{r.reason}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-3 text-xs text-gray-500">
                  <span>{r.level}</span>
                  <span>{r.duration}</span>
                </div>
                <Button size="sm" className="w-full">
                  Voir le cours
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-brand/5 to-transparent border-brand/20">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-bold text-gray-900">Analyse IA à venir</h3>
            <p className="text-sm text-gray-500">
              Bientôt, une IA analysera votre progression et vos centres d&apos;intérêt pour des recommandations encore plus pertinentes.
            </p>
          </div>
          <Sparkles className="size-8 text-brand/40 shrink-0" />
        </CardContent>
      </Card>
    </div>
  );
}
