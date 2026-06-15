'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

export function FaqSection() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section id="faq" className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-black text-gray-900">
          {t('faq.title')}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <ChevronDown
                  className={cn('size-5 text-gray-400 transition-transform shrink-0 ml-4', open === i && 'rotate-180')}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-50 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
