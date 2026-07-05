import type { Metadata } from 'next';
import { StaticPageShell } from '@/components/marketing/static-page-shell';
import { LegalSection } from '@/components/marketing/legal-section';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Total Innovation Learning',
  description: 'Comment Total Innovation Learning collecte, utilise et protège vos données personnelles.',
};

export default function PrivacyPage() {
  return (
    <StaticPageShell title="Politique de confidentialité" subtitle="Dernière mise à jour : 2026">
      <LegalSection title="1. Données que nous collectons">
        <p>
          Lors de la création de votre compte, nous collectons votre nom, prénom, adresse email et,
          facultativement, votre numéro de téléphone et une photo de profil. Si vous vous connectez via
          Google ou LinkedIn, nous recevons les informations de base de votre profil transmises par ces
          services.
        </p>
        <p>
          Nous conservons également votre historique d&apos;inscriptions, votre progression dans les
          cours, vos résultats de quiz et les certificats obtenus, nécessaires au fonctionnement de la
          plateforme.
        </p>
      </LegalSection>

      <LegalSection title="2. Paiements">
        <p>
          Les paiements sont traités par nos partenaires LigdiCash, CinetPay et Stripe. Total Innovation
          Learning ne stocke jamais les numéros de carte bancaire ou les identifiants Mobile Money : seul
          le statut et le montant de la transaction sont conservés dans notre système.
        </p>
      </LegalSection>

      <LegalSection title="3. Utilisation des données">
        <p>
          Vos données servent à faire fonctionner votre compte (accès aux cours, suivi de progression,
          délivrance de certificats), à vous contacter au sujet de votre formation, et à améliorer la
          plateforme. Nous ne vendons pas vos données personnelles à des tiers.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservation et suppression">
        <p>
          Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression
          de votre compte à tout moment ; celle-ci est traitée par désactivation puis effacement de vos
          données personnelles, à l&apos;exception des informations que nous devons conserver pour des
          obligations légales (ex. factures).
        </p>
      </LegalSection>

      <LegalSection title="5. Vos droits">
        <p>
          Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données personnelles
          en nous contactant à{' '}
          <a href="mailto:contact@total-innovation.net" className="text-brand hover:underline">
            contact@total-innovation.net
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies et sessions">
        <p>
          Nous utilisons des cookies et jetons de session strictement nécessaires au fonctionnement de la
          connexion et de la sécurité de votre compte (authentification, préférence de langue). Nous
          n&apos;utilisons pas de cookies publicitaires tiers.
        </p>
      </LegalSection>
    </StaticPageShell>
  );
}
