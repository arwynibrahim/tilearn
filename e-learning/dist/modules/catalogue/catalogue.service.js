"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CatalogueService", {
    enumerable: true,
    get: function() {
        return CatalogueService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CatalogueService = class CatalogueService {
    // ─── Domaines ───────────────────────────────────────────────
    async createDomain(dto) {
        const existing = await this.prisma.domain.findUnique({
            where: {
                slug: dto.slug
            }
        });
        if (existing) throw new _common.ConflictException('Ce slug de domaine existe déjà');
        return this.prisma.domain.create({
            data: dto
        });
    }
    async findAllDomains() {
        return this.prisma.domain.findMany({
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
    }
    async findOneDomain(id) {
        const domain = await this.prisma.domain.findUnique({
            where: {
                id
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
        if (!domain) throw new _common.NotFoundException('Domaine non trouvé');
        return domain;
    }
    // ─── Cours ──────────────────────────────────────────────────
    async createCourse(dto, userId) {
        const slug = dto.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return this.prisma.course.create({
            data: {
                ...dto,
                slug,
                createdBy: userId
            },
            include: {
                domain: true
            }
        });
    }
    async findAllCourses(page = 1, limit = 20, filters) {
        const where = {
            isPublished: true
        };
        if (filters?.domainId) where.domainId = filters.domainId;
        if (filters?.level) where.level = filters.level;
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: limit,
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
            }),
            this.prisma.course.count({
                where
            })
        ]);
        return {
            courses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOneCourse(slug) {
        const course = await this.prisma.course.findUnique({
            where: {
                slug
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
        if (!course) throw new _common.NotFoundException('Cours non trouvé');
        return course;
    }
    async updateCourse(id, dto) {
        const course = await this.prisma.course.findUnique({
            where: {
                id
            }
        });
        if (!course) throw new _common.NotFoundException('Cours non trouvé');
        return this.prisma.course.update({
            where: {
                id
            },
            data: dto,
            include: {
                domain: true
            }
        });
    }
    async removeCourse(id) {
        await this.prisma.course.update({
            where: {
                id
            },
            data: {
                isPublished: false
            }
        });
        return {
            message: 'Cours dépublié'
        };
    }
    // ─── Modules ────────────────────────────────────────────────
    async createModule(dto) {
        const course = await this.prisma.course.findUnique({
            where: {
                id: dto.courseId
            }
        });
        if (!course) throw new _common.NotFoundException('Cours non trouvé');
        const maxOrder = await this.prisma.module.aggregate({
            where: {
                courseId: dto.courseId
            },
            _max: {
                order: true
            }
        });
        const order = dto.order ?? (maxOrder._max.order ?? 0) + 1;
        return this.prisma.module.create({
            data: {
                ...dto,
                order
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
    }
    async findModulesByCourse(courseId) {
        return this.prisma.module.findMany({
            where: {
                courseId
            },
            orderBy: {
                order: 'asc'
            },
            include: {
                vrScene: true,
                quizzes: true
            }
        });
    }
    async updateModule(id, dto) {
        const mod = await this.prisma.module.findUnique({
            where: {
                id
            }
        });
        if (!mod) throw new _common.NotFoundException('Module non trouvé');
        return this.prisma.module.update({
            where: {
                id
            },
            data: dto
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CatalogueService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CatalogueService);

//# sourceMappingURL=catalogue.service.js.map