import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export const metadata: Metadata = {
  title: 'Espace personnel',
  description: 'Tableau de bord apprenant et administration.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
