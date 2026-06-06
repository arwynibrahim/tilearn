'use client';

import { Monitor, Cpu, GraduationCap, Building2 } from 'lucide-react';

const STATS = [
  { icon: GraduationCap, value: '5 000+', label: 'Apprenants formés', color: 'text-brand' },
  { icon: Monitor, value: '6', label: 'Simulations VR actives', color: 'text-blue-500' },
  { icon: Cpu, value: '99.9%', label: 'Disponibilité plateforme', color: 'text-green-500' },
  { icon: Building2, value: '8+', label: 'Partenaires institutionnels', color: 'text-purple-500' },
];

export function StatsSection() {
  return (
    <section className="border-y border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center">
              <s.icon className={`size-8 ${s.color}`} />
              <span className="text-3xl font-black text-gray-900">{s.value}</span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
