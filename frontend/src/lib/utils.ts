import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'XOF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(prenom?: string, nom?: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

/**
 * Set/remove a non-httpOnly cookie. Used so `src/proxy.ts` (Node.js runtime)
 * can read `accessToken` for route protection. Same XSS surface as localStorage,
 * which the app already uses for client-side auth.
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}
