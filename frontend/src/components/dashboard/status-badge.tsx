'use client';

import { Badge } from '@/components/ui/badge';
import type { EnrollmentStatus } from '@/types';

export const STATUS_VARIANT: Record<EnrollmentStatus, 'success' | 'info' | 'warning' | 'destructive'> = {
  ACTIVE: 'info',
  COMPLETED: 'success',
  EXPIRED: 'warning',
  DROPPED: 'destructive',
};

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: 'En cours',
  COMPLETED: 'Terminé',
  EXPIRED: 'Expiré',
  DROPPED: 'Abandonné',
};

export const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'> = {
  LEARNER: 'default',
  CREATOR: 'info',
  MANAGER: 'warning',
  ADMIN: 'warning',
  SUPER_ADMIN: 'secondary',
};

export const ROLE_LABELS: Record<string, string> = {
  LEARNER: 'Apprenant',
  CREATOR: 'Formateur',
  MANAGER: 'Manager',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant={ROLE_VARIANT[role] ?? 'default'}>{ROLE_LABELS[role] ?? role}</Badge>;
}
