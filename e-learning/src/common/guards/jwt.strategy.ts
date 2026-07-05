import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RolePermissions } from '../../modules/roles/permissions';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
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
      select: { id: true, email: true, role: true, nom: true, prenom: true, organizationId: true },
    });
    if (!user) throw new UnauthorizedException();

    const dbPerms = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: { select: { name: true } } },
    });

    // DB is source of truth; fall back to static map if seed hasn't run yet
    const permissions = dbPerms.length > 0
      ? dbPerms.map((rp) => rp.permission.name)
      : (RolePermissions[user.role] ?? []);

    return { ...user, permissions };
  }
}
