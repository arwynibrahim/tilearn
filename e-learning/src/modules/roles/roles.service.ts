import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { RolePermissions, Permissions, PermissionName } from './permissions';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getPermissionsForRole(role: Role): Promise<string[]> {
    const dbPerms = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: { select: { name: true } } },
    });
    return dbPerms.length > 0
      ? dbPerms.map((rp) => rp.permission.name)
      : (RolePermissions[role] ?? []);
  }

  async getUserPermissions(userId: string): Promise<{ memberships: any[]; permissions: string[] }> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { contextType: true, contextId: true, role: true },
    });
    if (!memberships.length) throw new NotFoundException('Aucun membership trouvé');

    const allRoles = [...new Set(memberships.map((m) => m.role))];
    const permissionsSet = new Set<string>();
    for (const role of allRoles) {
      const perms = await this.getPermissionsForRole(role);
      perms.forEach((p) => permissionsSet.add(p));
    }

    return { memberships, permissions: [...permissionsSet] };
  }

  async getAllPermissions() {
    const dbPerms = await this.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    const grouped: Record<string, any[]> = {};
    for (const perm of dbPerms) {
      const group = perm.group || 'Autres';
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(perm);
    }

    return grouped;
  }

  async syncPermissionsToDb() {
    const allDefinedPerms = Object.entries(Permissions).map(([key, name]) => ({
      name: name as string,
      group: key.split('_')[0],
    }));

    for (const perm of allDefinedPerms) {
      await this.prisma.permission.upsert({
        where: { name: perm.name },
        update: { group: perm.group },
        create: { name: perm.name, description: `Permission ${perm.name}`, group: perm.group },
      });
    }

    const roleNames = Object.keys(RolePermissions) as Role[];
    for (const role of roleNames) {
      const perms = RolePermissions[role];
      for (const permName of perms) {
        const perm = await this.prisma.permission.findUnique({ where: { name: permName } });
        if (perm) {
          await this.prisma.rolePermission.upsert({
            where: { role_permissionId: { role, permissionId: perm.id } },
            update: {},
            create: { role, permissionId: perm.id },
          });
        }
      }
    }

    return { message: 'Permissions synchronisées' };
  }

  async getUserWithPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, nom: true, prenom: true,
        memberships: { select: { contextType: true, contextId: true, role: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const allRoles = [...new Set(user.memberships.map((m) => m.role))];
    const permissionsSet = new Set<string>();
    for (const role of allRoles) {
      const perms = await this.getPermissionsForRole(role);
      perms.forEach((p) => permissionsSet.add(p));
    }

    return { ...user, permissions: [...permissionsSet] };
  }
}
