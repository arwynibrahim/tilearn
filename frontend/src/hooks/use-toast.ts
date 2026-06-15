'use client';

import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

let toastFn: ((options: ToastOptions) => void) | null = null;

export function setToastFunction(fn: (options: ToastOptions) => void) {
  toastFn = fn;
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    if (toastFn) {
      toastFn(options);
    } else {
      console.warn('Toast function not initialized');
    }
  }, []);

  return { toast };
}
