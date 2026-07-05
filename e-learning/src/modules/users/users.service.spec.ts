import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [
        { id: '1', email: 'a@test.com', nom: 'A', prenom: 'B', role: 'LEARNER', createdAt: new Date() },
      ];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        where: {},
        select: { id: true, email: true, nom: true, prenom: true, role: true, createdAt: true, organizationId: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        users,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should compute totalPages correctly', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(25);

      const result = await service.findAll(1, 10);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'user-1', email: 'test@test.com', nom: 'Dupont', prenom: 'Jean',
        telephone: '+33612345678', avatar: null, role: 'LEARNER',
        createdAt: new Date(), lastLoginAt: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true, email: true, nom: true, prenom: true, telephone: true,
          avatar: true, role: true, createdAt: true, lastLoginAt: true,
        },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const existingUser = { id: 'user-1', email: 'test@test.com', role: 'LEARNER' };
      const updateDto = { nom: 'Updated' };
      const updatedUser = { id: 'user-1', email: 'test@test.com', nom: 'Updated', prenom: 'Jean', role: 'LEARNER', updatedAt: new Date() };

      mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateDto, 'admin-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true, email: true, nom: true, prenom: true, telephone: true,
          avatar: true, role: true, createdAt: true, lastLoginAt: true,
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateDto,
        select: { id: true, email: true, nom: true, prenom: true, role: true, updatedAt: true },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('unknown-id', { nom: 'Test' }, 'admin-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const existingUser = { id: 'user-1', role: 'LEARNER' };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({ ...existingUser, deletedAt: new Date() });

      const result = await service.remove('user-1', 'admin-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true, email: true, nom: true, prenom: true, telephone: true,
          avatar: true, role: true, createdAt: true, lastLoginAt: true,
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual({ message: 'Utilisateur supprimé' });
    });

    it('should throw NotFoundException if user to delete does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('unknown-id', 'admin-1')).rejects.toThrow(NotFoundException);
    });
  });
});
