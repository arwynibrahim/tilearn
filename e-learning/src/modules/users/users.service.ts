import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { MembershipSlim, isPlatformAdmin, getAdminOrgIds } from '../../common/utils/membership.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, memberships: MembershipSlim[] = []) {
    const skip = (page - 1) * limit;

    let where: any = {};

    if (!isPlatformAdmin(memberships)) {
      const adminOrgIds = getAdminOrgIds(memberships);
      if (adminOrgIds.length === 0) {
        return { users: [], total: 0, page, limit, totalPages: 0 };
      }
      where = {
        memberships: {
          some: { contextType: 'ORGANIZATION', contextId: { in: adminOrgIds } },
        },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true, email: true, nom: true, prenom: true, createdAt: true,
          memberships: { select: { contextType: true, contextId: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        avatar: true, createdAt: true, lastLoginAt: true,
        memberships: { select: { contextType: true, contextId: true, role: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, nom: true, prenom: true, updatedAt: true },
    });
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Impossible de supprimer votre propre compte');
    }

    await this.findOne(id);

    const platformSuperAdminCount = await this.prisma.membership.count({
      where: { contextType: 'PLATFORM', role: 'SUPER_ADMIN' },
    });
    const isSuperAdmin = await this.prisma.membership.findFirst({
      where: { userId: id, contextType: 'PLATFORM', role: 'SUPER_ADMIN' },
    });
    if (isSuperAdmin && platformSuperAdminCount <= 1) {
      throw new ForbiddenException('Impossible de supprimer le dernier super administrateur');
    }

    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Utilisateur supprimé' };
  }
}
