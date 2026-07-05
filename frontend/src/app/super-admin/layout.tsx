import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export const metadata: Metadata = {
  title: 'Super Administration',
  description: 'Administration centrale de la plateforme.',
  robots: { index: false, follow: false },
};

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
