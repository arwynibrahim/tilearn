import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VrService } from './vr.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  module: { findUnique: jest.fn() },
  vRScene: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
};

describe('VrService', () => {
  let service: VrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VrService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VrService>(VrService);
    jest.clearAllMocks();
  });

  describe('createScene', () => {
    it('should create a VR scene', async () => {
      const dto = { moduleId: 'mod-1', title: 'Scene VR', sceneData: {} };
      mockPrisma.module.findUnique.mockResolvedValue({ id: 'mod-1' });
      mockPrisma.vRScene.create.mockResolvedValue({ id: 'scene-1', ...dto });

      const result = await service.createScene(dto);

      expect(mockPrisma.module.findUnique).toHaveBeenCalledWith({ where: { id: 'mod-1' } });
      expect(mockPrisma.vRScene.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 'scene-1', ...dto });
    });

    it('should throw NotFoundException if module not found', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(null);

      await expect(service.createScene({ moduleId: 'bad', title: 'Scene' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSceneByModule', () => {
    it('should return scene for module', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue({ id: 's1', moduleId: 'mod-1' });

      const result = await service.findSceneByModule('mod-1');

      expect(mockPrisma.vRScene.findUnique).toHaveBeenCalledWith({ where: { moduleId: 'mod-1' } });
      expect(result).toEqual({ id: 's1', moduleId: 'mod-1' });
    });

    it('should throw NotFoundException if no scene', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue(null);

      await expect(service.findSceneByModule('mod-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneScene', () => {
    it('should return scene by id', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue({ id: 's1' });

      const result = await service.findOneScene('s1');

      expect(mockPrisma.vRScene.findUnique).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(result).toEqual({ id: 's1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue(null);

      await expect(service.findOneScene('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateScene', () => {
    it('should update a scene', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.vRScene.update.mockResolvedValue({ id: 's1', title: 'Updated' });

      const result = await service.updateScene('s1', { title: 'Updated' });

      expect(mockPrisma.vRScene.findUnique).toHaveBeenCalledWith({ where: { id: 's1' } });
      expect(mockPrisma.vRScene.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { title: 'Updated' } });
      expect(result).toEqual({ id: 's1', title: 'Updated' });
    });

    it('should throw NotFoundException if scene not found', async () => {
      mockPrisma.vRScene.findUnique.mockResolvedValue(null);

      await expect(service.updateScene('bad', { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });
});
