import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandProps {
  href?: string;
  showText?: boolean;
  size?: number;
  textClassName?: string;
  className?: string;
}

/**
 * Brand lockup: the Total Innovation Learning logo (public/logo.png) shown as a
 * rounded badge, optionally followed by the wordmark. The logo PNG has a dark
 * background, so the rounded badge reads as intentional on both light and dark surfaces.
 */
export function Brand({
  href = '/',
  showText = true,
  size = 36,
  textClassName,
  className,
}: BrandProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="Total Innovation Learning"
        width={size}
        height={size}
        priority
        className="rounded-lg"
      />
      {showText && (
        <span className={cn('font-bold leading-none', textClassName)}>
          Total<span className="text-brand">Innovation</span>
        </span>
      )}
    </Link>
  );
}
