import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVRSceneDto } from './dto/create-vrscene.dto';

@Injectable()
export class VrService {
  constructor(private prisma: PrismaService) {}

  async createScene(dto: CreateVRSceneDto) {
    const module = await this.prisma.module.findUnique({ where: { id: dto.moduleId } });
    if (!module) throw new NotFoundException('Module non trouvé');

    return this.prisma.vRScene.create({ data: dto });
  }

  async findSceneByModule(moduleId: string) {
    const scene = await this.prisma.vRScene.findUnique({
      where: { moduleId },
    });
    if (!scene) throw new NotFoundException('Scène VR non trouvée pour ce module');
    return scene;
  }

  async findOneScene(id: string) {
    const scene = await this.prisma.vRScene.findUnique({
      where: { id },
    });
    if (!scene) throw new NotFoundException('Scène VR non trouvée');
    return scene;
  }

  async updateScene(id: string, dto: Partial<CreateVRSceneDto>) {
    await this.findOneScene(id);
    return this.prisma.vRScene.update({ where: { id }, data: dto });
  }

  async removeScene(id: string) {
    await this.findOneScene(id);
    await this.prisma.vRScene.delete({ where: { id } });
    return { message: 'Scène VR supprimée' };
  }
}
