import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface MembershipSlim {
  contextType: string;
  contextId: string | null;
  role: Role;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as { memberships?: MembershipSlim[] };
    if (!user?.memberships?.length) return false;

    const memberships: MembershipSlim[] = user.memberships;
    const orgId: string | undefined = request.params?.orgId;

    // SUPER_ADMIN check: must hold a PLATFORM membership with SUPER_ADMIN role
    if (requiredRoles.includes(Role.SUPER_ADMIN)) {
      const hasPlatform = memberships.some(
        (m) => m.contextType === 'PLATFORM' && m.role === Role.SUPER_ADMIN,
      );
      if (hasPlatform) return true;
    }

    // Org-scoped endpoint: verify the user holds the required role in that org
    if (orgId) {
      return memberships.some(
        (m) =>
          m.contextType === 'ORGANIZATION' &&
          m.contextId === orgId &&
          requiredRoles.includes(m.role),
      );
    }

    // Default: any membership (INDIVIDUAL or ORGANIZATION) with the required role
    return memberships.some((m) => requiredRoles.includes(m.role));
  }
}
