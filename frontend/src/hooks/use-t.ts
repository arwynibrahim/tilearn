'use client';

import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import { useLangStore } from '@/stores/lang.store';

type DeepValue<T> = T extends string
  ? string
  : T extends Record<string, unknown>
  ? { [K in keyof T]: DeepValue<T[K]> }
  : never;

const messages = { fr, en } as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const dict = messages[lang] as unknown as Record<string, unknown>;

  return function t(key: string): string {
    return getNestedValue(dict, key);
  };
}
