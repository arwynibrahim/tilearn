import type { Metadata } from 'next';
import { StaticPageShell } from '@/components/marketing/static-page-shell';
import { LegalSection } from '@/components/marketing/legal-section';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Total Innovation Learning",
  description: "Conditions générales d'utilisation de la plateforme Total Innovation Learning.",
};

export default function TermsPage() {
  return (
    <StaticPageShell title="Conditions Générales d'Utilisation" subtitle="Dernière mise à jour : 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
          l&apos;utilisation de la plateforme Total Innovation Learning (TIL), qui propose des cours en
          ligne, des simulations en réalité virtuelle et des services de certification.
        </p>
      </LegalSection>

      <LegalSection title="2. Compte utilisateur">
        <p>
          L&apos;inscription crée un compte apprenant. Vous êtes responsable de la confidentialité de vos
          identifiants et de toute activité effectuée depuis votre compte. Le rôle de formateur (Créateur)
          n&apos;est accordé que par un administrateur de la plateforme.
        </p>
      </LegalSection>

      <LegalSection title="3. Accès aux cours et paiement">
        <p>
          Certains cours sont gratuits, d&apos;autres payants. Les paiements sont traités via LigdiCash,
          CinetPay ou Stripe. L&apos;accès à un cours payant est activé après confirmation du paiement.
        </p>
      </LegalSection>

      <LegalSection title="4. Certificats">
        <p>
          Les certificats sont délivrés à l&apos;issue d&apos;un cours lorsque les critères de réussite
          définis par le formateur sont atteints. Chaque certificat comporte un identifiant unique et un
          QR code permettant sa vérification.
        </p>
      </LegalSection>

      <LegalSection title="5. Utilisation des équipements VR">
        <p>
          L&apos;utilisation de casques de réalité virtuelle se fait sous votre responsabilité et dans le
          respect des recommandations du fabricant. Une alternative en vidéo 360° est proposée lorsque vous
          ne disposez pas de casque.
        </p>
      </LegalSection>

      <LegalSection title="6. Licences pour organisations">
        <p>
          Les organisations partenaires peuvent acquérir des licences en volume pour leurs collaborateurs,
          incluant un tableau de bord de suivi et, selon l&apos;offre, la gestion d&apos;une flotte de
          casques VR. Les modalités spécifiques font l&apos;objet d&apos;un accord dédié.
        </p>
      </LegalSection>

      <LegalSection title="7. Résiliation">
        <p>
          Vous pouvez cesser d&apos;utiliser la plateforme et demander la suppression de votre compte à tout
          moment. Nous pouvons suspendre un compte en cas d&apos;usage frauduleux ou de non-respect des
          présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Pour toute question relative aux présentes CGU, contactez{' '}
          <a href="mailto:contact@total-innovation.net" className="text-brand hover:underline">
            contact@total-innovation.net
          </a>
          .
        </p>
      </LegalSection>
    </StaticPageShell>
  );
}
