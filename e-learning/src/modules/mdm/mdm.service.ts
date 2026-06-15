import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVRHeadsetDto } from './dto/create-vrheadset.dto';

@Injectable()
export class MdmService {
  constructor(private prisma: PrismaService) {}

  async createHeadset(dto: CreateVRHeadsetDto) {
    return this.prisma.vRHeadset.create({ data: dto });
  }

  async getOrganizationHeadsets(organizationId: string) {
    return this.prisma.vRHeadset.findMany({
      where: { organizationId },
      include: { assignedUser: { select: { id: true, nom: true, prenom: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateHeadsetStatus(id: string, status: string, batteryLevel?: number) {
    const headset = await this.prisma.vRHeadset.findUnique({ where: { id } });
    if (!headset) throw new NotFoundException('Casque VR non trouvé');

    return this.prisma.vRHeadset.update({
      where: { id },
      data: { status: status as any, batteryLevel, lastPing: new Date() },
    });
  }

  async assignHeadset(id: string, userId: string) {
    return this.prisma.vRHeadset.update({
      where: { id },
      data: { assignedUserId: userId, status: 'IN_USE' },
    });
  }

  async removeHeadset(id: string) {
    const headset = await this.prisma.vRHeadset.findUnique({
      where: { id },
      include: { _count: { select: { assignedUser: true } } },
    });
    if (!headset) throw new NotFoundException('Casque VR non trouvé');
    if (headset.assignedUserId) {
      throw new ConflictException('Impossible de supprimer un casque assigné à un utilisateur. Désassignez-le d\'abord.');
    }

    await this.prisma.vRHeadset.delete({ where: { id } });
    return { message: 'Casque VR supprimé' };
  }

  // ─── Stations de charge ─────────────────────────────────────

  async createChargingStation(data: { organizationId: string; model?: string; portsTotal: number; portsAvailable: number; location?: string }) {
    return this.prisma.chargingStation.create({ data });
  }

  async getOrganizationChargingStations(organizationId: string) {
    return this.prisma.chargingStation.findMany({ where: { organizationId } });
  }

  async removeChargingStation(id: string) {
    const station = await this.prisma.chargingStation.findUnique({ where: { id } });
    if (!station) throw new NotFoundException('Station de charge non trouvée');

    await this.prisma.chargingStation.delete({ where: { id } });
    return { message: 'Station de charge supprimée' };
  }
}
