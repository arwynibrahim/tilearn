import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RolePermissions, Permissions } from './permissions';

const mockPrisma = {
  user: { findUnique: jest.fn() },
  permission: { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn() },
  rolePermission: { upsert: jest.fn() },
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for a role', async () => {
      const result = await service.getPermissionsForRole('LEARNER' as any);
      expect(result).toEqual(RolePermissions['LEARNER']);
    });

    it('should return empty array for unknown role', async () => {
      const result = await service.getPermissionsForRole('UNKNOWN' as any);
      expect(result).toEqual([]);
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions for user role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'INSTRUCTOR' });

      const result = await service.getUserPermissions('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { role: true },
      });
      expect(result).toEqual(RolePermissions['INSTRUCTOR']);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserPermissions('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPermissions', () => {
    it('should return grouped permissions from DB', async () => {
      const dbPerms = [
        { id: 'p1', name: 'user:read', group: 'USER', description: '' },
        { id: 'p2', name: 'user:create', group: 'USER', description: '' },
        { id: 'p3', name: 'course:read', group: 'COURSE', description: '' },
      ];
      mockPrisma.permission.findMany.mockResolvedValue(dbPerms);

      const result = await service.getAllPermissions();

      expect(mockPrisma.permission.findMany).toHaveBeenCalledWith({
        orderBy: [{ group: 'asc' }, { name: 'asc' }],
      });
      expect(result).toEqual({
        USER: [dbPerms[0], dbPerms[1]],
        COURSE: [dbPerms[2]],
      });
    });
  });

  describe('syncPermissionsToDb', () => {
    it('should upsert permissions and role-permission mappings', async () => {
      const permCount = Object.keys(Permissions).length;
      mockPrisma.permission.findUnique.mockResolvedValue({ id: 'perm-1' });
      mockPrisma.rolePermission.upsert.mockResolvedValue({});

      const result = await service.syncPermissionsToDb();

      expect(mockPrisma.permission.upsert).toHaveBeenCalledTimes(permCount);
      expect(mockPrisma.rolePermission.upsert).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Permissions synchronisées' });
    });
  });

  describe('getUserWithPermissions', () => {
    it('should return user with permissions', async () => {
      const user = { id: 'u1', email: 'test@test.com', nom: 'D', prenom: 'J', role: 'LEARNER' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserWithPermissions('u1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { id: true, email: true, nom: true, prenom: true, role: true },
      });
      expect(result).toEqual({ ...user, permissions: RolePermissions['LEARNER'] });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserWithPermissions('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
