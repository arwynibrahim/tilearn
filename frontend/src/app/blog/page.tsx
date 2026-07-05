import type { Metadata } from 'next';
import { Banknote, BookOpen, Headphones, ShieldCheck } from 'lucide-react';
import { StaticPageShell } from '@/components/marketing/static-page-shell';

export const metadata: Metadata = {
  title: 'Blog — Total Innovation Learning',
  description: 'Actualités et nouveautés de la plateforme Total Innovation Learning.',
};

const UPDATES = [
  {
    icon: Headphones,
    title: 'Simulations VR en santé et agriculture',
    desc: 'Des modules immersifs compatibles Meta Quest et Pico, avec un mode 360° de secours sur simple navigateur pour les apprenants sans casque.',
  },
  {
    icon: Banknote,
    title: 'Paiement Mobile Money',
    desc: 'Les inscriptions peuvent être réglées via LigdiCash, CinetPay ou Stripe, en FCFA, pour lever la barrière de la carte bancaire.',
  },
  {
    icon: ShieldCheck,
    title: 'Certificats vérifiables par QR code',
    desc: 'Chaque certificat délivré est vérifiable en ligne, ce qui facilite sa reconnaissance par les employeurs partenaires.',
  },
  {
    icon: BookOpen,
    title: 'Catalogue multi-domaines',
    desc: "Développement, santé, agriculture, business : de nouveaux cours et parcours sont ajoutés régulièrement au catalogue.",
  },
];

export default function BlogPage() {
  return (
    <StaticPageShell
      title="Actualités TIL"
      subtitle="Les dernières nouveautés de la plateforme"
    >
      <p className="mb-10 text-gray-600 leading-relaxed">
        Nous préparons des articles de fond sur l&apos;apprentissage en réalité virtuelle, la formation
        professionnelle en Afrique francophone et les coulisses du produit. En attendant, voici les
        dernières évolutions de la plateforme.
      </p>

      <div className="space-y-4">
        {UPDATES.map((u) => (
          <div key={u.title} className="flex items-start gap-4 rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <u.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="mb-1 font-bold text-gray-900">{u.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{u.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}
