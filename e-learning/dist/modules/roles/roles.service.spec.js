"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _rolesservice = require("./roles.service");
const _prismaservice = require("../../prisma/prisma.service");
const _permissions = require("./permissions");
const mockPrisma = {
    user: {
        findUnique: jest.fn()
    },
    permission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn()
    },
    rolePermission: {
        upsert: jest.fn()
    }
};
describe('RolesService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _rolesservice.RolesService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_rolesservice.RolesService);
        jest.clearAllMocks();
    });
    describe('getPermissionsForRole', ()=>{
        it('should return permissions for a role', async ()=>{
            const result = await service.getPermissionsForRole('LEARNER');
            expect(result).toEqual(_permissions.RolePermissions['LEARNER']);
        });
        it('should return empty array for unknown role', async ()=>{
            const result = await service.getPermissionsForRole('UNKNOWN');
            expect(result).toEqual([]);
        });
    });
    describe('getUserPermissions', ()=>{
        it('should return permissions for user role', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                role: 'INSTRUCTOR'
            });
            const result = await service.getUserPermissions('user-1');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                select: {
                    role: true
                }
            });
            expect(result).toEqual(_permissions.RolePermissions['INSTRUCTOR']);
        });
        it('should throw NotFoundException if user not found', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.getUserPermissions('bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('getAllPermissions', ()=>{
        it('should return grouped permissions from DB', async ()=>{
            const dbPerms = [
                {
                    id: 'p1',
                    name: 'user:read',
                    group: 'USER',
                    description: ''
                },
                {
                    id: 'p2',
                    name: 'user:create',
                    group: 'USER',
                    description: ''
                },
                {
                    id: 'p3',
                    name: 'course:read',
                    group: 'COURSE',
                    description: ''
                }
            ];
            mockPrisma.permission.findMany.mockResolvedValue(dbPerms);
            const result = await service.getAllPermissions();
            expect(mockPrisma.permission.findMany).toHaveBeenCalledWith({
                orderBy: [
                    {
                        group: 'asc'
                    },
                    {
                        name: 'asc'
                    }
                ]
            });
            expect(result).toEqual({
                USER: [
                    dbPerms[0],
                    dbPerms[1]
                ],
                COURSE: [
                    dbPerms[2]
                ]
            });
        });
    });
    describe('syncPermissionsToDb', ()=>{
        it('should upsert permissions and role-permission mappings', async ()=>{
            const permCount = Object.keys(_permissions.Permissions).length;
            mockPrisma.permission.findUnique.mockResolvedValue({
                id: 'perm-1'
            });
            mockPrisma.rolePermission.upsert.mockResolvedValue({});
            const result = await service.syncPermissionsToDb();
            expect(mockPrisma.permission.upsert).toHaveBeenCalledTimes(permCount);
            expect(mockPrisma.rolePermission.upsert).toHaveBeenCalled();
            expect(result).toEqual({
                message: 'Permissions synchronisées'
            });
        });
    });
    describe('getUserWithPermissions', ()=>{
        it('should return user with permissions', async ()=>{
            const user = {
                id: 'u1',
                email: 'test@test.com',
                nom: 'D',
                prenom: 'J',
                role: 'LEARNER'
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            const result = await service.getUserWithPermissions('u1');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'u1'
                },
                select: {
                    id: true,
                    email: true,
                    nom: true,
                    prenom: true,
                    role: true
                }
            });
            expect(result).toEqual({
                ...user,
                permissions: _permissions.RolePermissions['LEARNER']
            });
        });
        it('should throw NotFoundException if user not found', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.getUserWithPermissions('bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
});

//# sourceMappingURL=roles.service.spec.js.map