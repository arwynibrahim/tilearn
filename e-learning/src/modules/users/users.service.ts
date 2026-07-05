import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, userRole?: string, userOrgId?: string) {
    const skip = (page - 1) * limit;
    const where = userRole === 'ADMIN_INSTITUTION' && userOrgId ? { organizationId: userOrgId } : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        select: { id: true, email: true, nom: true, prenom: true, role: true, createdAt: true, organizationId: true },
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
        avatar: true, role: true, createdAt: true, lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const user = await this.findOne(id);

    // Empêcher la modification d'un autre SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN' && id !== currentUserId) {
      throw new ForbiddenException('Impossible de modifier un autre super administrateur');
    }

    // Empêcher de se rétrograder soi-même si dernier SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN' && dto.role && dto.role !== 'SUPER_ADMIN') {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'SUPER_ADMIN', deletedAt: null },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Impossible de rétrograder le dernier super administrateur');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, nom: true, prenom: true, role: true, updatedAt: true },
    });
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.findOne(id);

    // Empêcher la suppression d'un SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Impossible de supprimer un super administrateur');
    }

    // Empêcher l'auto-suppression
    if (id === currentUserId) {
      throw new ForbiddenException('Impossible de supprimer votre propre compte');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Utilisateur supprimé' };
  }
}
