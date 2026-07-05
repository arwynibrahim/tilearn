import type { Metadata } from 'next';
import { StaticPageShell } from '@/components/marketing/static-page-shell';
import { LegalSection } from '@/components/marketing/legal-section';

export const metadata: Metadata = {
  title: 'Mentions légales — Total Innovation Learning',
  description: 'Mentions légales de la plateforme Total Innovation Learning.',
};

export default function LegalNoticePage() {
  return (
    <StaticPageShell title="Mentions légales">
      <LegalSection title="Éditeur du site">
        <p>
          Total Innovation Learning
          <br />
          Ouagadougou, Burkina Faso
          <br />
          Email : contact@total-innovation.net
          <br />
          Numéro RCCM : [à compléter]
          <br />
          Identifiant IFU : [à compléter]
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>[à compléter]</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>[Nom de l&apos;hébergeur, adresse — à compléter]</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur la plateforme (textes, cours, vidéos, simulations VR,
          logos) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation, est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à ces mentions légales, contactez{' '}
          <a href="mailto:contact@total-innovation.net" className="text-brand hover:underline">
            contact@total-innovation.net
          </a>
          .
        </p>
      </LegalSection>
    </StaticPageShell>
  );
}
