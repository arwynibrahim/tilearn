"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _catalogueservice = require("./catalogue.service");
const _prismaservice = require("../../prisma/prisma.service");
const mockPrisma = {
    domain: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn()
    },
    course: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
    },
    module: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn()
    }
};
describe('CatalogueService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _catalogueservice.CatalogueService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_catalogueservice.CatalogueService);
        jest.clearAllMocks();
    });
    describe('createDomain', ()=>{
        it('should create a domain', async ()=>{
            const dto = {
                name: 'Dev',
                slug: 'dev',
                icon: 'code',
                description: 'Dev courses'
            };
            mockPrisma.domain.findUnique.mockResolvedValue(null);
            mockPrisma.domain.create.mockResolvedValue({
                id: 'domain-1',
                ...dto
            });
            const result = await service.createDomain(dto);
            expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
                where: {
                    slug: 'dev'
                }
            });
            expect(mockPrisma.domain.create).toHaveBeenCalledWith({
                data: dto
            });
            expect(result).toEqual({
                id: 'domain-1',
                ...dto
            });
        });
        it('should throw ConflictException if slug exists', async ()=>{
            mockPrisma.domain.findUnique.mockResolvedValue({
                id: 'existing'
            });
            await expect(service.createDomain({
                name: 'Dev',
                slug: 'dev'
            })).rejects.toThrow(_common.ConflictException);
        });
    });
    describe('findAllDomains', ()=>{
        it('should return all domains with course count', async ()=>{
            const domains = [
                {
                    id: 'd1',
                    name: 'Dev',
                    _count: {
                        courses: 5
                    }
                }
            ];
            mockPrisma.domain.findMany.mockResolvedValue(domains);
            const result = await service.findAllDomains();
            expect(mockPrisma.domain.findMany).toHaveBeenCalledWith({
                include: {
                    _count: {
                        select: {
                            courses: true
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            expect(result).toEqual(domains);
        });
    });
    describe('findOneDomain', ()=>{
        it('should return a domain with courses', async ()=>{
            const domain = {
                id: 'd1',
                name: 'Dev',
                courses: []
            };
            mockPrisma.domain.findUnique.mockResolvedValue(domain);
            const result = await service.findOneDomain('d1');
            expect(mockPrisma.domain.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'd1'
                },
                include: {
                    courses: {
                        where: {
                            isPublished: true
                        },
                        include: {
                            modules: true
                        }
                    }
                }
            });
            expect(result).toEqual(domain);
        });
        it('should throw NotFoundException if domain not found', async ()=>{
            mockPrisma.domain.findUnique.mockResolvedValue(null);
            await expect(service.findOneDomain('unknown')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('createCourse', ()=>{
        it('should create a course with auto-generated slug', async ()=>{
            const dto = {
                title: 'Introduction au Cloud AWS',
                description: 'Desc',
                domainId: 'domain-1'
            };
            const created = {
                id: 'course-1',
                ...dto,
                slug: 'introduction-au-cloud-aws',
                createdBy: 'user-1',
                domain: {
                    id: 'domain-1'
                }
            };
            mockPrisma.course.create.mockResolvedValue(created);
            const result = await service.createCourse(dto, 'user-1');
            expect(mockPrisma.course.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    slug: 'introduction-au-cloud-aws',
                    createdBy: 'user-1'
                },
                include: {
                    domain: true
                }
            });
            expect(result).toEqual(created);
        });
        it('should handle special characters in slug generation', async ()=>{
            const dto = {
                title: 'Éléctronique & Mécanique!',
                domainId: 'd1'
            };
            mockPrisma.course.create.mockResolvedValue({
                id: 'c1',
                slug: 'electronique-mecanique',
                ...dto,
                createdBy: 'u1',
                domain: {}
            });
            const result = await service.createCourse(dto, 'u1');
            expect(result.slug).toBe('electronique-mecanique');
        });
    });
    describe('findAllCourses', ()=>{
        it('should return paginated courses with filters', async ()=>{
            const courses = [
                {
                    id: 'c1',
                    title: 'Course 1'
                }
            ];
            mockPrisma.course.findMany.mockResolvedValue(courses);
            mockPrisma.course.count.mockResolvedValue(1);
            const result = await service.findAllCourses(1, 10, {
                domainId: 'd1',
                level: 'BEGINNER'
            });
            expect(mockPrisma.course.findMany).toHaveBeenCalledWith({
                where: {
                    isPublished: true,
                    domainId: 'd1',
                    level: 'BEGINNER'
                },
                skip: 0,
                take: 10,
                include: {
                    domain: true,
                    creator: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true
                        }
                    },
                    _count: {
                        select: {
                            modules: true,
                            enrollments: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(result).toEqual({
                courses,
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1
            });
        });
        it('should return courses without filters', async ()=>{
            mockPrisma.course.findMany.mockResolvedValue([]);
            mockPrisma.course.count.mockResolvedValue(0);
            const result = await service.findAllCourses(1, 20);
            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    isPublished: true
                }
            }));
            expect(result.totalPages).toBe(0);
        });
    });
    describe('findOneCourse', ()=>{
        it('should return a course by slug', async ()=>{
            const course = {
                id: 'c1',
                slug: 'mon-cours',
                domain: {},
                creator: {},
                modules: [],
                reviews: []
            };
            mockPrisma.course.findUnique.mockResolvedValue(course);
            const result = await service.findOneCourse('mon-cours');
            expect(mockPrisma.course.findUnique).toHaveBeenCalledWith({
                where: {
                    slug: 'mon-cours'
                },
                include: {
                    domain: true,
                    creator: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            avatar: true
                        }
                    },
                    modules: {
                        orderBy: {
                            order: 'asc'
                        }
                    },
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    nom: true,
                                    prenom: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                }
            });
            expect(result).toEqual(course);
        });
        it('should throw NotFoundException if course not found', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue(null);
            await expect(service.findOneCourse('unknown')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('updateCourse', ()=>{
        it('should update a course', async ()=>{
            const existing = {
                id: 'c1',
                title: 'Old'
            };
            const dto = {
                title: 'New Title'
            };
            const updated = {
                id: 'c1',
                title: 'New Title',
                slug: 'old',
                domain: {
                    id: 'd1'
                }
            };
            mockPrisma.course.findUnique.mockResolvedValue(existing);
            mockPrisma.course.update.mockResolvedValue(updated);
            const result = await service.updateCourse('c1', dto);
            expect(mockPrisma.course.update).toHaveBeenCalledWith({
                where: {
                    id: 'c1'
                },
                data: dto,
                include: {
                    domain: true
                }
            });
            expect(result).toEqual(updated);
        });
        it('should throw NotFoundException if course not found', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue(null);
            await expect(service.updateCourse('unknown', {
                title: 'New'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('removeCourse', ()=>{
        it('should unpublish a course', async ()=>{
            mockPrisma.course.update.mockResolvedValue({
                id: 'c1',
                isPublished: false
            });
            const result = await service.removeCourse('c1');
            expect(mockPrisma.course.update).toHaveBeenCalledWith({
                where: {
                    id: 'c1'
                },
                data: {
                    isPublished: false
                }
            });
            expect(result).toEqual({
                message: 'Cours dépublié'
            });
        });
    });
    describe('createModule', ()=>{
        it('should create a module with auto-incremented order', async ()=>{
            const dto = {
                title: 'Module 1',
                type: 'VIDEO',
                courseId: 'course-1'
            };
            const course = {
                id: 'course-1'
            };
            const created = {
                id: 'mod-1',
                ...dto,
                order: 1,
                course: {
                    id: 'course-1',
                    title: 'Course'
                }
            };
            mockPrisma.course.findUnique.mockResolvedValue(course);
            mockPrisma.module.aggregate.mockResolvedValue({
                _max: {
                    order: 0
                }
            });
            mockPrisma.module.create.mockResolvedValue(created);
            const result = await service.createModule(dto);
            expect(mockPrisma.module.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    order: 1
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });
            expect(result).toEqual(created);
        });
        it('should use provided order if specified', async ()=>{
            const dto = {
                title: 'Mod',
                type: 'QUIZ',
                courseId: 'course-1',
                order: 5
            };
            mockPrisma.course.findUnique.mockResolvedValue({
                id: 'course-1'
            });
            mockPrisma.module.create.mockResolvedValue({
                id: 'mod-1',
                ...dto,
                order: 5,
                course: {}
            });
            const result = await service.createModule(dto);
            expect(mockPrisma.module.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    order: 5
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });
        });
        it('should throw NotFoundException if course not found', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue(null);
            await expect(service.createModule({
                title: 'Mod',
                type: 'VIDEO',
                courseId: 'bad'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('findModulesByCourse', ()=>{
        it('should return modules for a course', async ()=>{
            const modules = [
                {
                    id: 'm1',
                    vrScene: null,
                    quizzes: []
                }
            ];
            mockPrisma.module.findMany.mockResolvedValue(modules);
            const result = await service.findModulesByCourse('course-1');
            expect(mockPrisma.module.findMany).toHaveBeenCalledWith({
                where: {
                    courseId: 'course-1'
                },
                orderBy: {
                    order: 'asc'
                },
                include: {
                    vrScene: true,
                    quizzes: true
                }
            });
            expect(result).toEqual(modules);
        });
    });
    describe('updateModule', ()=>{
        it('should update a module', async ()=>{
            const existing = {
                id: 'm1',
                title: 'Old'
            };
            const dto = {
                title: 'New'
            };
            mockPrisma.module.findUnique.mockResolvedValue(existing);
            mockPrisma.module.update.mockResolvedValue({
                id: 'm1',
                title: 'New'
            });
            const result = await service.updateModule('m1', dto);
            expect(mockPrisma.module.update).toHaveBeenCalledWith({
                where: {
                    id: 'm1'
                },
                data: dto
            });
            expect(result).toEqual({
                id: 'm1',
                title: 'New'
            });
        });
        it('should throw NotFoundException if module not found', async ()=>{
            mockPrisma.module.findUnique.mockResolvedValue(null);
            await expect(service.updateModule('unknown', {
                title: 'New'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
});

//# sourceMappingURL=catalogue.service.spec.js.map