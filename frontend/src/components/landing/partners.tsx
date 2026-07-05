const PARTNERS = [
  'AWS', 'Banque Mondiale', 'EY', 'FAFPA',
  'Université de Ouagadougou', 'CHU Yalgado', 'FAO', 'UNICEF',
  'AWS', 'Banque Mondiale', 'EY', 'FAFPA',
  'Université de Ouagadougou', 'CHU Yalgado', 'FAO', 'UNICEF',
];

export function PartnersMarquee() {
  return (
    <section className="bg-gray-50 py-8 overflow-hidden">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
        Ils nous font confiance
      </p>
      <div className="flex w-max animate-marquee items-center gap-12 motion-reduce:animate-none">
        {PARTNERS.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="mx-8 whitespace-nowrap text-sm font-semibold text-gray-500 hover:text-brand transition-colors"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
