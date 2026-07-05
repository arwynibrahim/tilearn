import type { Metadata } from 'next';
import { Building2, Mail, MapPin } from 'lucide-react';
import { StaticPageShell } from '@/components/marketing/static-page-shell';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact — Total Innovation Learning',
  description: 'Contactez l\'équipe Total Innovation Learning pour toute question ou projet de formation.',
};

const INFO = [
  { icon: MapPin, label: 'Adresse', value: 'Ouagadougou, Burkina Faso' },
  { icon: Mail, label: 'Email', value: 'contact@total-innovation.net' },
  { icon: Building2, label: 'Organisations', value: 'Formations sur mesure pour vos équipes' },
];

export default function ContactPage() {
  return (
    <StaticPageShell
      title="Contactez-nous"
      subtitle="Une question, un projet de formation, un partenariat ? Écrivez-nous."
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {INFO.map((i) => (
            <div key={i.label} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <i.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{i.label}</p>
                <p className="text-sm text-gray-900">{i.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </StaticPageShell>
  );
}
