import type { Metadata } from 'next';
import { GraduationCap, Globe2, HeartHandshake, Rocket } from 'lucide-react';
import { StaticPageShell } from '@/components/marketing/static-page-shell';

export const metadata: Metadata = {
  title: 'À propos — Total Innovation Learning',
  description: "La mission, la vision et les valeurs de Total Innovation Learning.",
};

const VALUES = [
  {
    icon: Rocket,
    title: 'Innovation pédagogique',
    desc: "Nous combinons réalité virtuelle, intelligence artificielle et formats interactifs pour rendre l'apprentissage concret, mémorable et applicable dès le premier jour.",
  },
  {
    icon: Globe2,
    title: 'Ancrage local, ambition continentale',
    desc: "Conçue depuis Ouagadougou, notre plateforme intègre les réalités du terrain : paiement Mobile Money, contenus en français, connexions à faible bande passante.",
  },
  {
    icon: HeartHandshake,
    title: 'Partenariats de confiance',
    desc: 'Nous travaillons avec des institutions académiques, hospitalières et des entreprises pour garantir des contenus certifiants et reconnus sur le marché du travail.',
  },
  {
    icon: GraduationCap,
    title: "Accès à l'excellence",
    desc: "Notre objectif est de rendre une formation de niveau international accessible au plus grand nombre, sans que le matériel ou le coût ne soient une barrière.",
  },
];

export default function AboutPage() {
  return (
    <StaticPageShell
      title="À propos de TIL"
      subtitle="Former l'Afrique de demain par l'immersion VR & IA"
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Total Innovation Learning (TIL) est une plateforme e-learning née d&apos;un constat simple :
          l&apos;accès à une formation professionnelle de qualité reste inégal en Afrique francophone,
          alors que la demande de compétences dans le numérique, la santé et l&apos;agriculture n&apos;a
          jamais été aussi forte.
        </p>
        <p>
          Nous construisons une plateforme qui combine des cours certifiants, des simulations en réalité
          virtuelle et des outils pensés pour le contexte local — paiement par Mobile Money, contenus en
          français, partenariats avec des institutions et entreprises de la sous-région — afin que la
          distance ou le matériel ne soient plus un frein à l&apos;apprentissage.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <v.icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mb-2 font-bold text-gray-900">{v.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}
