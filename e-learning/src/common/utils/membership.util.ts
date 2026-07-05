import { ForbiddenException } from '@nestjs/common';

export interface MembershipSlim {
  contextType: string;
  contextId: string | null;
  role: string;
}

export function isPlatformAdmin(memberships: MembershipSlim[]): boolean {
  return memberships.some(
    (m) => m.contextType === 'PLATFORM' && m.role === 'SUPER_ADMIN',
  );
}

export function getAdminOrgIds(memberships: MembershipSlim[]): string[] {
  return memberships
    .filter(
      (m) =>
        m.contextType === 'ORGANIZATION' &&
        m.contextId &&
        (m.role === 'ADMIN' || m.role === 'MANAGER'),
    )
    .map((m) => m.contextId as string);
}

export function assertOrgAccess(memberships: MembershipSlim[], orgId: string): void {
  if (isPlatformAdmin(memberships)) return;
  const allowed = getAdminOrgIds(memberships);
  if (!allowed.includes(orgId)) {
    throw new ForbiddenException('Accès refusé à cette organisation');
  }
}
