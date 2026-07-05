import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RolePermissions } from '../../modules/roles/permissions';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_PUBLIC_KEY')!,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, nom: true, prenom: true },
    });
    if (!user) throw new UnauthorizedException();

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
      select: { contextType: true, contextId: true, role: true },
    });

    // Union of all permissions across all memberships
    const allRoles = [...new Set(memberships.map((m) => m.role))];
    const permissionsSet = new Set<string>();
    for (const role of allRoles) {
      const rolePerms = await this.prisma.rolePermission.findMany({
        where: { role },
        include: { permission: { select: { name: true } } },
      });
      if (rolePerms.length > 0) {
        rolePerms.forEach((rp) => permissionsSet.add(rp.permission.name));
      } else {
        // Fallback to static map if DB not seeded yet
        (RolePermissions[role] ?? []).forEach((p) => permissionsSet.add(p));
      }
    }

    return { ...user, memberships, permissions: [...permissionsSet] };
  }
}
