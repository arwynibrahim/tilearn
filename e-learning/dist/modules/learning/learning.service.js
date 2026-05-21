"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LearningService", {
    enumerable: true,
    get: function() {
        return LearningService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LearningService = class LearningService {
    // ─── Inscriptions ───────────────────────────────────────────
    async enroll(dto, userId) {
        const course = await this.prisma.course.findUnique({
            where: {
                id: dto.courseId
            }
        });
        if (!course) throw new _common.NotFoundException('Cours non trouvé');
        const existing = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId: dto.courseId,
                status: 'ACTIVE'
            }
        });
        if (existing) throw new _common.BadRequestException('Déjà inscrit à ce cours');
        return this.prisma.enrollment.create({
            data: {
                userId,
                courseId: dto.courseId
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
    async getUserEnrollments(userId) {
        return this.prisma.enrollment.findMany({
            where: {
                userId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnail: true,
                        level: true
                    }
                }
            },
            orderBy: {
                enrolledAt: 'desc'
            }
        });
    }
    // ─── Progression ────────────────────────────────────────────
    async updateProgress(userId, moduleId, data) {
        const module = await this.prisma.module.findUnique({
            where: {
                id: moduleId
            }
        });
        if (!module) throw new _common.NotFoundException('Module non trouvé');
        const existing = await this.prisma.progress.findUnique({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId
                }
            }
        });
        if (existing) {
            return this.prisma.progress.update({
                where: {
                    id: existing.id
                },
                data: {
                    ...data,
                    completedAt: data.status === 'COMPLETED' ? new Date() : undefined
                }
            });
        }
        return this.prisma.progress.create({
            data: {
                userId,
                moduleId,
                ...data,
                startedAt: new Date()
            }
        });
    }
    async getUserProgress(userId, courseId) {
        const modules = await this.prisma.module.findMany({
            where: {
                courseId
            },
            orderBy: {
                order: 'asc'
            }
        });
        const progress = await this.prisma.progress.findMany({
            where: {
                userId,
                module: {
                    courseId
                }
            }
        });
        const modulesWithProgress = modules.map((mod)=>{
            const prog = progress.find((p)=>p.moduleId === mod.id);
            return {
                ...mod,
                progress: prog || {
                    status: 'NOT_STARTED',
                    score: null,
                    timeSpentSeconds: 0
                }
            };
        });
        const totalModules = modules.length;
        const completedModules = progress.filter((p)=>p.status === 'COMPLETED').length;
        const completionPercent = totalModules > 0 ? Math.round(completedModules / totalModules * 100) : 0;
        return {
            modules: modulesWithProgress,
            stats: {
                totalModules,
                completedModules,
                completionPercent
            }
        };
    }
    // ─── Quiz ───────────────────────────────────────────────────
    async submitQuiz(dto, userId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: {
                id: dto.quizId
            },
            include: {
                questions: true
            }
        });
        if (!quiz) throw new _common.NotFoundException('Quiz non trouvé');
        let score = 0;
        const totalPoints = quiz.questions.reduce((sum, q)=>sum + (q.points || 1), 0);
        for (const answer of dto.answers){
            const question = quiz.questions.find((q)=>q.id === answer.questionId);
            if (question && question.correctAnswer === answer.answer) {
                score += question.points || 1;
            }
        }
        const finalScore = totalPoints > 0 ? score / totalPoints * 100 : 0;
        const passed = quiz.passingScore ? finalScore >= quiz.passingScore : finalScore >= 50;
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                userId,
                quizId: dto.quizId,
                score: finalScore,
                answers: dto.answers,
                startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
                completedAt: new Date(),
                passed
            }
        });
        return {
            attempt,
            score: finalScore,
            passed,
            totalQuestions: quiz.questions.length,
            correctAnswers: score
        };
    }
    async getUserQuizAttempts(userId, quizId) {
        return this.prisma.quizAttempt.findMany({
            where: {
                userId,
                quizId
            },
            orderBy: {
                completedAt: 'desc'
            }
        });
    }
    // ─── Certificats ────────────────────────────────────────────
    async generateCertificate(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: 'COMPLETED'
            }
        });
        if (!enrollment) throw new _common.BadRequestException('Cours non terminé');
        const certificateUid = _crypto.randomUUID();
        const verificationUrl = `https://tilearning.net/verify/${certificateUid}`;
        return this.prisma.certificate.create({
            data: {
                userId,
                courseId,
                certificateUid,
                verificationUrl,
                qrCodeHash: _crypto.createHash('sha256').update(certificateUid).digest('hex')
            },
            include: {
                user: {
                    select: {
                        nom: true,
                        prenom: true
                    }
                },
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });
    }
    async getUserCertificates(userId) {
        return this.prisma.certificate.findMany({
            where: {
                userId,
                revokedAt: null
            },
            include: {
                course: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                issuedAt: 'desc'
            }
        });
    }
    async verifyCertificate(uid) {
        const cert = await this.prisma.certificate.findUnique({
            where: {
                certificateUid: uid
            },
            include: {
                user: {
                    select: {
                        nom: true,
                        prenom: true
                    }
                },
                course: {
                    select: {
                        title: true,
                        domain: true
                    }
                }
            }
        });
        if (!cert || cert.revokedAt) throw new _common.NotFoundException('Certificat invalide ou révoqué');
        return {
            valid: true,
            ...cert
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
LearningService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], LearningService);

//# sourceMappingURL=learning.service.js.map