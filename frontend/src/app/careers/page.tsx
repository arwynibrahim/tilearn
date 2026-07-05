import type { Metadata } from 'next';
import { Heart, Laptop, TrendingUp, Users } from 'lucide-react';
import { StaticPageShell } from '@/components/marketing/static-page-shell';

export const metadata: Metadata = {
  title: 'Carrières — Total Innovation Learning',
  description: 'Rejoignez Total Innovation Learning et participez à la formation de l\'Afrique de demain.',
};

const REASONS = [
  { icon: TrendingUp, title: 'Impact réel', desc: "Chaque fonctionnalité livrée aide directement des apprenants à progresser vers un métier ou une certification." },
  { icon: Laptop, title: 'Stack moderne', desc: 'Next.js, NestJS, réalité virtuelle, paiement mobile money : des défis techniques concrets sur un produit en croissance.' },
  { icon: Users, title: 'Équipe restreinte, décisions rapides', desc: "Peu de couches hiérarchiques : vos idées peuvent atterrir en production en quelques semaines." },
  { icon: Heart, title: 'Mission avant tout', desc: "Nous recrutons des personnes motivées par l'accès à l'éducation en Afrique francophone, pas seulement par la technique." },
];

export default function CareersPage() {
  return (
    <StaticPageShell
      title="Carrières chez TIL"
      subtitle="Aidez-nous à rendre la formation professionnelle accessible partout en Afrique francophone"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {REASONS.map((r) => (
          <div key={r.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <r.icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mb-2 font-bold text-gray-900">{r.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-900">Aucun poste ouvert pour le moment</h2>
        <p className="mb-6 text-sm text-gray-600">
          Nous n&apos;avons pas d&apos;offre active actuellement, mais nous étudions volontiers les
          candidatures spontanées — développement, contenu pédagogique, VR, ou partenariats.
        </p>
        <a
          href="mailto:contact@total-innovation.net?subject=Candidature%20spontan%C3%A9e"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-600"
        >
          Envoyer une candidature spontanée
        </a>
      </div>
    </StaticPageShell>
  );
}
