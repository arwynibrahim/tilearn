'use client';

import Image from 'next/image';
import { BookOpen } from 'lucide-react';

interface CourseThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
}

const GRADIENTS = [
  'from-brand to-brand-600',
  'from-navy to-navy-700',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

function getGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function CourseThumbnail({ src, alt, className = '' }: CourseThumbnailProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  const gradient = getGradient(alt);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/20">
            <span className="text-2xl font-black text-white">{alt[0]}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
        <BookOpen className="size-3 text-white" />
        <span className="text-xs font-medium text-white">TIL</span>
      </div>
    </div>
  );
}
