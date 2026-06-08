import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/10 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-full.jpeg"
              alt="Total Innovation Learning"
              width={180}
              height={135}
              className="mb-4 rounded-xl"
            />
            <p className="text-sm text-gray-500">Former l&apos;Afrique de demain par l&apos;immersion VR &amp; IA.</p>
            <p className="mt-3 text-xs text-gray-600">
              Ouagadougou, Burkina Faso
              <br />
              contact@totalinnovation.bf
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Produit</h4>
            <ul className="space-y-2 text-sm">
              {[['/#courses', 'Cours'], ['/#vr', 'Démos VR'], ['/#pricing', 'Tarifs']].map(
                ([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-brand transition-colors">
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              {[['#', 'À propos'], ['#', 'Carrières'], ['#', 'Blog'], ['#', 'Contact']].map(
                ([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-brand transition-colors">
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Légal</h4>
            <ul className="space-y-2 text-sm">
              {[['#', 'Confidentialité'], ['#', 'CGU'], ['#', 'Mentions légales']].map(
                ([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-brand transition-colors">
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Total Innovation Learning. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand/20 px-2 py-0.5 text-brand">FR</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
