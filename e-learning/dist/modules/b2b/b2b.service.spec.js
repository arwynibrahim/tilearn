"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _b2bservice = require("./b2b.service");
const _prismaservice = require("../../prisma/prisma.service");
const mockPrisma = {
    organization: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn()
    },
    license: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
    },
    licenseAssignment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
    },
    learningPath: {
        create: jest.fn(),
        findMany: jest.fn()
    }
};
describe('B2bService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _b2bservice.B2bService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_b2bservice.B2bService);
        jest.clearAllMocks();
    });
    describe('createOrganization', ()=>{
        it('should create an organization', async ()=>{
            const dto = {
                name: 'Org',
                type: _client.OrganizationType.UNIVERSITY
            };
            mockPrisma.organization.create.mockResolvedValue({
                id: 'org-1',
                ...dto
            });
            const result = await service.createOrganization(dto);
            expect(mockPrisma.organization.create).toHaveBeenCalledWith({
                data: dto
            });
            expect(result).toEqual({
                id: 'org-1',
                ...dto
            });
        });
    });
    describe('findAllOrganizations', ()=>{
        it('should return all organizations with counts', async ()=>{
            const orgs = [
                {
                    id: 'o1',
                    name: 'Org',
                    _count: {
                        licenses: 2,
                        learningPaths: 1,
                        vrHeadsets: 5
                    }
                }
            ];
            mockPrisma.organization.findMany.mockResolvedValue(orgs);
            const result = await service.findAllOrganizations();
            expect(mockPrisma.organization.findMany).toHaveBeenCalledWith({
                include: {
                    _count: {
                        select: {
                            licenses: true,
                            learningPaths: true,
                            vrHeadsets: true
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            expect(result).toEqual(orgs);
        });
    });
    describe('findOneOrganization', ()=>{
        it('should return organization with details', async ()=>{
            const org = {
                id: 'o1',
                name: 'Org',
                licenses: [],
                learningPaths: [],
                vrHeadsets: []
            };
            mockPrisma.organization.findUnique.mockResolvedValue(org);
            const result = await service.findOneOrganization('o1');
            expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'o1'
                },
                include: {
                    licenses: true,
                    learningPaths: {
                        include: {
                            courses: {
                                include: {
                                    course: true
                                }
                            }
                        }
                    },
                    vrHeadsets: true
                }
            });
            expect(result).toEqual(org);
        });
        it('should throw NotFoundException', async ()=>{
            mockPrisma.organization.findUnique.mockResolvedValue(null);
            await expect(service.findOneOrganization('bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('createLicense', ()=>{
        it('should create a license for existing org', async ()=>{
            const dto = {
                organizationId: 'org-1',
                plan: _client.LicensePlan.ENTERPRISE_100,
                quantity: 10,
                startDate: '2025-01-01',
                endDate: '2025-12-31'
            };
            mockPrisma.organization.findUnique.mockResolvedValue({
                id: 'org-1'
            });
            mockPrisma.license.create.mockResolvedValue({
                id: 'lic-1',
                ...dto
            });
            const result = await service.createLicense(dto);
            expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'org-1'
                }
            });
            expect(mockPrisma.license.create).toHaveBeenCalledWith({
                data: dto
            });
            expect(result).toEqual({
                id: 'lic-1',
                ...dto
            });
        });
        it('should throw NotFoundException if org not found', async ()=>{
            mockPrisma.organization.findUnique.mockResolvedValue(null);
            await expect(service.createLicense({
                organizationId: 'bad',
                plan: _client.LicensePlan.ENTERPRISE_100,
                quantity: 1,
                startDate: '',
                endDate: ''
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('assignLicense', ()=>{
        it('should assign license and increment usedCount', async ()=>{
            mockPrisma.license.findUnique.mockResolvedValue({
                id: 'lic-1',
                quantity: 10,
                usedCount: 3
            });
            mockPrisma.licenseAssignment.create.mockResolvedValue({
                id: 'assign-1',
                licenseId: 'lic-1',
                userId: 'u1',
                assignedBy: 'admin'
            });
            mockPrisma.license.update.mockResolvedValue({});
            const result = await service.assignLicense('lic-1', 'u1', 'admin');
            expect(mockPrisma.license.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'lic-1'
                }
            });
            expect(mockPrisma.licenseAssignment.create).toHaveBeenCalledWith({
                data: {
                    licenseId: 'lic-1',
                    userId: 'u1',
                    assignedBy: 'admin'
                }
            });
            expect(mockPrisma.license.update).toHaveBeenCalledWith({
                where: {
                    id: 'lic-1'
                },
                data: {
                    usedCount: {
                        increment: 1
                    }
                }
            });
            expect(result).toEqual({
                id: 'assign-1',
                licenseId: 'lic-1',
                userId: 'u1',
                assignedBy: 'admin'
            });
        });
        it('should throw error if license exhausted', async ()=>{
            mockPrisma.license.findUnique.mockResolvedValue({
                id: 'lic-1',
                quantity: 5,
                usedCount: 5
            });
            await expect(service.assignLicense('lic-1', 'u1', 'admin')).rejects.toThrow('Licence épuisée');
        });
        it('should throw NotFoundException if license not found', async ()=>{
            mockPrisma.license.findUnique.mockResolvedValue(null);
            await expect(service.assignLicense('bad', 'u1', 'admin')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('revokeLicense', ()=>{
        it('should revoke assignment and decrement usedCount', async ()=>{
            mockPrisma.licenseAssignment.findUnique.mockResolvedValue({
                id: 'assign-1',
                licenseId: 'lic-1'
            });
            mockPrisma.license.update.mockResolvedValue({});
            mockPrisma.licenseAssignment.update.mockResolvedValue({
                id: 'assign-1',
                revokedAt: new Date()
            });
            const result = await service.revokeLicense('assign-1');
            expect(mockPrisma.licenseAssignment.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'assign-1'
                }
            });
            expect(mockPrisma.license.update).toHaveBeenCalledWith({
                where: {
                    id: 'lic-1'
                },
                data: {
                    usedCount: {
                        decrement: 1
                    }
                }
            });
            expect(result.revokedAt).toBeDefined();
        });
        it('should throw NotFoundException if assignment not found', async ()=>{
            mockPrisma.licenseAssignment.findUnique.mockResolvedValue(null);
            await expect(service.revokeLicense('bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('getOrganizationLicenses', ()=>{
        it('should return licenses with assignments', async ()=>{
            mockPrisma.license.findMany.mockResolvedValue([
                {
                    id: 'lic-1',
                    assignments: []
                }
            ]);
            const result = await service.getOrganizationLicenses('org-1');
            expect(mockPrisma.license.findMany).toHaveBeenCalledWith({
                where: {
                    organizationId: 'org-1'
                },
                include: {
                    assignments: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    nom: true,
                                    prenom: true
                                }
                            }
                        }
                    }
                }
            });
            expect(result).toEqual([
                {
                    id: 'lic-1',
                    assignments: []
                }
            ]);
        });
    });
    describe('createLearningPath', ()=>{
        it('should create learning path with courses', async ()=>{
            const dto = {
                organizationId: 'org-1',
                title: 'Path',
                courses: [
                    {
                        courseId: 'c1'
                    },
                    {
                        courseId: 'c2'
                    }
                ]
            };
            mockPrisma.learningPath.create.mockResolvedValue({
                id: 'lp-1',
                ...dto,
                courses: []
            });
            const result = await service.createLearningPath(dto);
            expect(mockPrisma.learningPath.create).toHaveBeenCalledWith({
                data: {
                    organizationId: 'org-1',
                    title: 'Path',
                    description: undefined,
                    isMandatory: undefined,
                    createdBy: undefined,
                    courses: {
                        create: [
                            {
                                courseId: 'c1',
                                order: 1
                            },
                            {
                                courseId: 'c2',
                                order: 2
                            }
                        ]
                    }
                },
                include: {
                    courses: {
                        include: {
                            course: true
                        }
                    }
                }
            });
            expect(result).toEqual({
                id: 'lp-1',
                ...dto,
                courses: []
            });
        });
    });
    describe('getOrganizationLearningPaths', ()=>{
        it('should return learning paths for org', async ()=>{
            mockPrisma.learningPath.findMany.mockResolvedValue([
                {
                    id: 'lp-1',
                    courses: []
                }
            ]);
            const result = await service.getOrganizationLearningPaths('org-1');
            expect(mockPrisma.learningPath.findMany).toHaveBeenCalledWith({
                where: {
                    organizationId: 'org-1'
                },
                include: {
                    courses: {
                        include: {
                            course: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true
                                }
                            }
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            });
            expect(result).toEqual([
                {
                    id: 'lp-1',
                    courses: []
                }
            ]);
        });
    });
});

//# sourceMappingURL=b2b.service.spec.js.map