'use client';

import { Quote } from 'lucide-react';
import { useT } from '@/hooks/use-t';

const TESTIMONIALS = [
  {
    quote: "La simulation VR d'anatomie m'a permis de comprendre en quelques heures ce que des semaines de cours théoriques n'avaient pas réussi à m'expliquer.",
    name: 'Aïcha Ouédraogo',
    role: 'Étudiante en soins infirmiers, Ouagadougou',
    initials: 'AO',
  },
  {
    quote: "Le certificat vérifiable par QR code a rassuré mon employeur. J'ai pu évoluer vers un poste DevOps six mois après ma formation.",
    name: 'Boukary Sawadogo',
    role: 'Ingénieur DevOps',
    initials: 'BS',
  },
  {
    quote: "Le paiement Mobile Money a tout changé : plus besoin de carte bancaire pour accéder à une formation de qualité internationale.",
    name: 'Fatimata Kaboré',
    role: 'Entrepreneure agricole',
    initials: 'FK',
  },
];

export function TestimonialsSection() {
  const t = useT();

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <Quote className="mb-4 size-8 text-brand/30" aria-hidden="true" />
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-gray-700">
                {item.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
