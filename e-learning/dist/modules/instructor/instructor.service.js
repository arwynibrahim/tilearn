"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InstructorService", {
    enumerable: true,
    get: function() {
        return InstructorService;
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
let InstructorService = class InstructorService {
    async getProfile(userId) {
        let profile = await this.prisma.instructorProfile.findUnique({
            where: {
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        nom: true,
                        prenom: true,
                        avatar: true
                    }
                }
            }
        });
        if (!profile) {
            profile = await this.prisma.instructorProfile.create({
                data: {
                    userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            nom: true,
                            prenom: true,
                            avatar: true
                        }
                    }
                }
            });
        }
        return profile;
    }
    async updateProfile(userId, data) {
        await this.getProfile(userId);
        return this.prisma.instructorProfile.update({
            where: {
                userId
            },
            data,
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
        });
    }
    async getInstructorCourses(userId) {
        return this.prisma.course.findMany({
            where: {
                createdBy: userId
            },
            include: {
                domain: true,
                _count: {
                    select: {
                        modules: true,
                        enrollments: true,
                        reviews: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getInstructorStats(userId) {
        const courses = await this.prisma.course.findMany({
            where: {
                createdBy: userId
            },
            select: {
                id: true
            }
        });
        const courseIds = courses.map((c)=>c.id);
        const [totalEnrollments, totalReviews, avgRating] = await Promise.all([
            this.prisma.enrollment.count({
                where: {
                    courseId: {
                        in: courseIds
                    }
                }
            }),
            this.prisma.courseReview.count({
                where: {
                    courseId: {
                        in: courseIds
                    }
                }
            }),
            this.prisma.courseReview.aggregate({
                where: {
                    courseId: {
                        in: courseIds
                    }
                },
                _avg: {
                    rating: true
                }
            })
        ]);
        return {
            totalCourses: courses.length,
            totalEnrollments,
            totalReviews,
            averageRating: avgRating._avg.rating || 0
        };
    }
    // ─── Avis ───────────────────────────────────────────────────
    async createReview(dto, userId) {
        return this.prisma.courseReview.create({
            data: {
                ...dto,
                userId
            },
            include: {
                user: {
                    select: {
                        nom: true,
                        prenom: true,
                        avatar: true
                    }
                }
            }
        });
    }
    async getCourseReviews(courseId) {
        return this.prisma.courseReview.findMany({
            where: {
                courseId
            },
            include: {
                user: {
                    select: {
                        nom: true,
                        prenom: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
InstructorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], InstructorService);

//# sourceMappingURL=instructor.service.js.map