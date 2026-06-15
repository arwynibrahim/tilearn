'use client';

import { useState, useEffect, useCallback } from 'react';
import { Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport } from '@/components/ui/toast';
import { setToastFunction } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'destructive';
}

const ICONS = {
  success: CheckCircle2,
  destructive: AlertCircle,
  default: Info,
};

let toastId = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((options: { title: string; description?: string; variant?: 'default' | 'success' | 'destructive' }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...options, id, variant: options.variant ?? 'default' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    setToastFunction(addToast);
    return () => setToastFunction(() => {});
  }, [addToast]);

  return (
    <ToastViewport>
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <Toast key={t.id} variant={t.variant}>
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1">
                <ToastTitle>{t.title}</ToastTitle>
                {t.description && <ToastDescription>{t.description}</ToastDescription>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        );
      })}
    </ToastViewport>
  );
}
