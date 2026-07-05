import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVRHeadsetDto } from './dto/create-vrheadset.dto';
import { MembershipSlim, assertOrgAccess } from '../../common/utils/membership.util';

@Injectable()
export class MdmService {
  constructor(private prisma: PrismaService) {}

  async createHeadset(dto: CreateVRHeadsetDto, memberships?: MembershipSlim[]) {
    if (memberships) assertOrgAccess(memberships, dto.organizationId);
    return this.prisma.vRHeadset.create({ data: dto });
  }

  async getOrganizationHeadsets(organizationId: string) {
    return this.prisma.vRHeadset.findMany({
      where: { organizationId },
      include: { assignedUser: { select: { id: true, nom: true, prenom: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateHeadsetStatus(id: string, status: string, batteryLevel?: number, memberships?: MembershipSlim[]) {
    const headset = await this.prisma.vRHeadset.findUnique({ where: { id } });
    if (!headset) throw new NotFoundException('Casque VR non trouvé');
    if (memberships) assertOrgAccess(memberships, headset.organizationId);

    return this.prisma.vRHeadset.update({
      where: { id },
      data: { status: status as any, batteryLevel, lastPing: new Date() },
    });
  }

  async assignHeadset(id: string, userId: string, memberships?: MembershipSlim[]) {
    const headset = await this.prisma.vRHeadset.findUnique({ where: { id } });
    if (!headset) throw new NotFoundException('Casque VR non trouvé');
    if (memberships) assertOrgAccess(memberships, headset.organizationId);

    return this.prisma.vRHeadset.update({
      where: { id },
      data: { assignedUserId: userId, status: 'IN_USE' },
    });
  }

  async removeHeadset(id: string, memberships?: MembershipSlim[]) {
    const headset = await this.prisma.vRHeadset.findUnique({ where: { id } });
    if (!headset) throw new NotFoundException('Casque VR non trouvé');
    if (memberships) assertOrgAccess(memberships, headset.organizationId);
    if (headset.assignedUserId) {
      throw new ConflictException('Impossible de supprimer un casque assigné à un utilisateur. Désassignez-le d\'abord.');
    }

    await this.prisma.vRHeadset.delete({ where: { id } });
    return { message: 'Casque VR supprimé' };
  }

  // ─── Stations de charge ─────────────────────────────────────

  async createChargingStation(
    data: { organizationId: string; model?: string; portsTotal: number; portsAvailable: number; location?: string },
    memberships?: MembershipSlim[],
  ) {
    if (memberships) assertOrgAccess(memberships, data.organizationId);
    return this.prisma.chargingStation.create({ data });
  }

  async getOrganizationChargingStations(organizationId: string) {
    return this.prisma.chargingStation.findMany({ where: { organizationId } });
  }

  async removeChargingStation(id: string, memberships?: MembershipSlim[]) {
    const station = await this.prisma.chargingStation.findUnique({ where: { id } });
    if (!station) throw new NotFoundException('Station de charge non trouvée');
    if (memberships) assertOrgAccess(memberships, station.organizationId);

    await this.prisma.chargingStation.delete({ where: { id } });
    return { message: 'Station de charge supprimée' };
  }
}
