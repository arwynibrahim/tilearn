"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bService", {
    enumerable: true,
    get: function() {
        return B2bService;
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
let B2bService = class B2bService {
    // ─── Organizations ──────────────────────────────────────────
    async createOrganization(dto) {
        return this.prisma.organization.create({
            data: dto
        });
    }
    async findAllOrganizations() {
        return this.prisma.organization.findMany({
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
    }
    async findOneOrganization(id) {
        const org = await this.prisma.organization.findUnique({
            where: {
                id
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
        if (!org) throw new _common.NotFoundException('Organisation non trouvée');
        return org;
    }
    // ─── Licences ───────────────────────────────────────────────
    async createLicense(dto) {
        const org = await this.prisma.organization.findUnique({
            where: {
                id: dto.organizationId
            }
        });
        if (!org) throw new _common.NotFoundException('Organisation non trouvée');
        return this.prisma.license.create({
            data: dto
        });
    }
    async assignLicense(licenseId, userId, assignedBy) {
        const license = await this.prisma.license.findUnique({
            where: {
                id: licenseId
            }
        });
        if (!license) throw new _common.NotFoundException('Licence non trouvée');
        if (license.usedCount >= license.quantity) throw new Error('Licence épuisée');
        const assignment = await this.prisma.licenseAssignment.create({
            data: {
                licenseId,
                userId,
                assignedBy
            }
        });
        await this.prisma.license.update({
            where: {
                id: licenseId
            },
            data: {
                usedCount: {
                    increment: 1
                }
            }
        });
        return assignment;
    }
    async revokeLicense(assignmentId) {
        const assignment = await this.prisma.licenseAssignment.findUnique({
            where: {
                id: assignmentId
            }
        });
        if (!assignment) throw new _common.NotFoundException('Assignation non trouvée');
        await this.prisma.license.update({
            where: {
                id: assignment.licenseId
            },
            data: {
                usedCount: {
                    decrement: 1
                }
            }
        });
        return this.prisma.licenseAssignment.update({
            where: {
                id: assignmentId
            },
            data: {
                revokedAt: new Date()
            }
        });
    }
    async getOrganizationLicenses(organizationId) {
        return this.prisma.license.findMany({
            where: {
                organizationId
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
    }
    // ─── Parcours d'apprentissage ───────────────────────────────
    async createLearningPath(dto) {
        return this.prisma.learningPath.create({
            data: {
                organizationId: dto.organizationId,
                title: dto.title,
                description: dto.description,
                isMandatory: dto.isMandatory,
                createdBy: dto.createdBy,
                courses: {
                    create: dto.courses.map((c, i)=>({
                            courseId: c.courseId,
                            order: i + 1
                        }))
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
    }
    async getOrganizationLearningPaths(organizationId) {
        return this.prisma.learningPath.findMany({
            where: {
                organizationId
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
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bService);

//# sourceMappingURL=b2b.service.js.map