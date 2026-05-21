"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _mdmservice = require("./mdm.service");
const _prismaservice = require("../../prisma/prisma.service");
const mockPrisma = {
    vRHeadset: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
    },
    chargingStation: {
        create: jest.fn(),
        findMany: jest.fn()
    }
};
describe('MdmService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _mdmservice.MdmService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_mdmservice.MdmService);
        jest.clearAllMocks();
    });
    describe('createHeadset', ()=>{
        it('should create a VR headset', async ()=>{
            const dto = {
                organizationId: 'org-1',
                serialNumber: 'SN-001',
                model: 'META_QUEST_3'
            };
            mockPrisma.vRHeadset.create.mockResolvedValue({
                id: 'h-1',
                ...dto
            });
            const result = await service.createHeadset(dto);
            expect(mockPrisma.vRHeadset.create).toHaveBeenCalledWith({
                data: dto
            });
            expect(result).toEqual({
                id: 'h-1',
                ...dto
            });
        });
    });
    describe('getOrganizationHeadsets', ()=>{
        it('should return headsets for org', async ()=>{
            mockPrisma.vRHeadset.findMany.mockResolvedValue([
                {
                    id: 'h1',
                    assignedUser: null
                }
            ]);
            const result = await service.getOrganizationHeadsets('org-1');
            expect(mockPrisma.vRHeadset.findMany).toHaveBeenCalledWith({
                where: {
                    organizationId: 'org-1'
                },
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(result).toEqual([
                {
                    id: 'h1',
                    assignedUser: null
                }
            ]);
        });
    });
    describe('updateHeadsetStatus', ()=>{
        it('should update status and battery', async ()=>{
            mockPrisma.vRHeadset.findUnique.mockResolvedValue({
                id: 'h1'
            });
            mockPrisma.vRHeadset.update.mockResolvedValue({
                id: 'h1',
                status: 'IN_USE',
                batteryLevel: 80
            });
            const result = await service.updateHeadsetStatus('h1', 'IN_USE', 80);
            expect(mockPrisma.vRHeadset.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'h1'
                }
            });
            expect(mockPrisma.vRHeadset.update).toHaveBeenCalledWith({
                where: {
                    id: 'h1'
                },
                data: {
                    status: 'IN_USE',
                    batteryLevel: 80,
                    lastPing: expect.any(Date)
                }
            });
            expect(result).toEqual({
                id: 'h1',
                status: 'IN_USE',
                batteryLevel: 80
            });
        });
        it('should throw NotFoundException if headset not found', async ()=>{
            mockPrisma.vRHeadset.findUnique.mockResolvedValue(null);
            await expect(service.updateHeadsetStatus('bad', 'IN_USE')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('assignHeadset', ()=>{
        it('should assign headset to user', async ()=>{
            mockPrisma.vRHeadset.update.mockResolvedValue({
                id: 'h1',
                assignedUserId: 'u1',
                status: 'IN_USE'
            });
            const result = await service.assignHeadset('h1', 'u1');
            expect(mockPrisma.vRHeadset.update).toHaveBeenCalledWith({
                where: {
                    id: 'h1'
                },
                data: {
                    assignedUserId: 'u1',
                    status: 'IN_USE'
                }
            });
            expect(result).toEqual({
                id: 'h1',
                assignedUserId: 'u1',
                status: 'IN_USE'
            });
        });
    });
    describe('createChargingStation', ()=>{
        it('should create a charging station', async ()=>{
            const data = {
                organizationId: 'org-1',
                portsTotal: 10,
                portsAvailable: 10
            };
            mockPrisma.chargingStation.create.mockResolvedValue({
                id: 'cs-1',
                ...data
            });
            const result = await service.createChargingStation(data);
            expect(mockPrisma.chargingStation.create).toHaveBeenCalledWith({
                data
            });
            expect(result).toEqual({
                id: 'cs-1',
                ...data
            });
        });
    });
    describe('getOrganizationChargingStations', ()=>{
        it('should return charging stations', async ()=>{
            mockPrisma.chargingStation.findMany.mockResolvedValue([
                {
                    id: 'cs1'
                }
            ]);
            const result = await service.getOrganizationChargingStations('org-1');
            expect(mockPrisma.chargingStation.findMany).toHaveBeenCalledWith({
                where: {
                    organizationId: 'org-1'
                }
            });
            expect(result).toEqual([
                {
                    id: 'cs1'
                }
            ]);
        });
    });
});

//# sourceMappingURL=mdm.service.spec.js.map