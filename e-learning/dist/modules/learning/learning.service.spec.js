"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _learningservice = require("./learning.service");
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
jest.mock('crypto', ()=>({
        randomUUID: jest.fn(),
        createHash: jest.fn()
    }));
const mockPrisma = {
    course: {
        findUnique: jest.fn()
    },
    enrollment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn()
    },
    module: {
        findUnique: jest.fn(),
        findMany: jest.fn()
    },
    progress: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    },
    quiz: {
        findUnique: jest.fn()
    },
    quizAttempt: {
        create: jest.fn(),
        findMany: jest.fn()
    },
    certificate: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn()
    }
};
describe('LearningService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _learningservice.LearningService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_learningservice.LearningService);
        jest.clearAllMocks();
    });
    describe('enroll', ()=>{
        it('should enroll user in a course', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue({
                id: 'course-1'
            });
            mockPrisma.enrollment.findFirst.mockResolvedValue(null);
            mockPrisma.enrollment.create.mockResolvedValue({
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                course: {
                    id: 'course-1',
                    title: 'Course'
                }
            });
            const result = await service.enroll({
                courseId: 'course-1'
            }, 'user-1');
            expect(mockPrisma.course.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'course-1'
                }
            });
            expect(mockPrisma.enrollment.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    courseId: 'course-1',
                    status: 'ACTIVE'
                }
            });
            expect(mockPrisma.enrollment.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    courseId: 'course-1'
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
            expect(result).toEqual({
                id: 'enr-1',
                userId: 'user-1',
                courseId: 'course-1',
                course: {
                    id: 'course-1',
                    title: 'Course'
                }
            });
        });
        it('should throw NotFoundException if course not found', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue(null);
            await expect(service.enroll({
                courseId: 'bad'
            }, 'user-1')).rejects.toThrow(_common.NotFoundException);
        });
        it('should throw BadRequestException if already enrolled', async ()=>{
            mockPrisma.course.findUnique.mockResolvedValue({
                id: 'course-1'
            });
            mockPrisma.enrollment.findFirst.mockResolvedValue({
                id: 'existing'
            });
            await expect(service.enroll({
                courseId: 'course-1'
            }, 'user-1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('getUserEnrollments', ()=>{
        it('should return user enrollments', async ()=>{
            const enrollments = [
                {
                    id: 'e1',
                    course: {
                        id: 'c1',
                        title: 'Course'
                    }
                }
            ];
            mockPrisma.enrollment.findMany.mockResolvedValue(enrollments);
            const result = await service.getUserEnrollments('user-1');
            expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1'
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
            expect(result).toEqual(enrollments);
        });
    });
    describe('updateProgress', ()=>{
        it('should create progress if not existing', async ()=>{
            mockPrisma.module.findUnique.mockResolvedValue({
                id: 'mod-1'
            });
            mockPrisma.progress.findUnique.mockResolvedValue(null);
            mockPrisma.progress.create.mockResolvedValue({
                id: 'p1',
                userId: 'u1',
                moduleId: 'mod-1',
                status: 'IN_PROGRESS'
            });
            const result = await service.updateProgress('u1', 'mod-1', {
                status: 'IN_PROGRESS'
            });
            expect(mockPrisma.progress.create).toHaveBeenCalledWith({
                data: {
                    userId: 'u1',
                    moduleId: 'mod-1',
                    status: 'IN_PROGRESS',
                    startedAt: expect.any(Date)
                }
            });
            expect(result).toEqual({
                id: 'p1',
                userId: 'u1',
                moduleId: 'mod-1',
                status: 'IN_PROGRESS'
            });
        });
        it('should update existing progress', async ()=>{
            mockPrisma.module.findUnique.mockResolvedValue({
                id: 'mod-1'
            });
            mockPrisma.progress.findUnique.mockResolvedValue({
                id: 'p1',
                userId: 'u1',
                moduleId: 'mod-1'
            });
            mockPrisma.progress.update.mockResolvedValue({
                id: 'p1',
                status: 'COMPLETED'
            });
            const result = await service.updateProgress('u1', 'mod-1', {
                status: 'COMPLETED'
            });
            expect(mockPrisma.progress.update).toHaveBeenCalledWith({
                where: {
                    id: 'p1'
                },
                data: {
                    status: 'COMPLETED',
                    completedAt: expect.any(Date)
                }
            });
            expect(result).toEqual({
                id: 'p1',
                status: 'COMPLETED'
            });
        });
        it('should throw NotFoundException if module not found', async ()=>{
            mockPrisma.module.findUnique.mockResolvedValue(null);
            await expect(service.updateProgress('u1', 'bad', {})).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('getUserProgress', ()=>{
        it('should return progress with stats', async ()=>{
            const modules = [
                {
                    id: 'm1',
                    title: 'M1'
                },
                {
                    id: 'm2',
                    title: 'M2'
                }
            ];
            const progress = [
                {
                    id: 'p1',
                    moduleId: 'm1',
                    status: 'COMPLETED',
                    score: null,
                    timeSpentSeconds: 0
                }
            ];
            mockPrisma.module.findMany.mockResolvedValue(modules);
            mockPrisma.progress.findMany.mockResolvedValue(progress);
            const result = await service.getUserProgress('u1', 'course-1');
            expect(result.stats).toEqual({
                totalModules: 2,
                completedModules: 1,
                completionPercent: 50
            });
            expect(result.modules).toHaveLength(2);
            expect(result.modules[0].progress.status).toBe('COMPLETED');
            expect(result.modules[1].progress.status).toBe('NOT_STARTED');
        });
    });
    describe('submitQuiz', ()=>{
        const quiz = {
            id: 'q1',
            passingScore: 60,
            questions: [
                {
                    id: 'q1',
                    points: 2,
                    correctAnswer: 'A'
                },
                {
                    id: 'q2',
                    points: 1,
                    correctAnswer: 'B'
                }
            ]
        };
        it('should submit quiz and calculate score', async ()=>{
            mockPrisma.quiz.findUnique.mockResolvedValue(quiz);
            mockPrisma.quizAttempt.create.mockResolvedValue({
                id: 'a1'
            });
            const result = await service.submitQuiz({
                quizId: 'q1',
                answers: [
                    {
                        questionId: 'q1',
                        answer: 'A'
                    },
                    {
                        questionId: 'q2',
                        answer: 'C'
                    }
                ]
            }, 'user-1');
            const expectedScore = 2 / 3 * 100;
            expect(mockPrisma.quizAttempt.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    quizId: 'q1',
                    score: expectedScore,
                    answers: [
                        {
                            questionId: 'q1',
                            answer: 'A'
                        },
                        {
                            questionId: 'q2',
                            answer: 'C'
                        }
                    ],
                    startedAt: undefined,
                    completedAt: expect.any(Date),
                    passed: true
                }
            });
            expect(result.score).toBe(expectedScore);
            expect(result.passed).toBe(true);
            expect(result.correctAnswers).toBe(2);
        });
        it('should mark as passed if score >= passingScore', async ()=>{
            mockPrisma.quiz.findUnique.mockResolvedValue(quiz);
            mockPrisma.quizAttempt.create.mockResolvedValue({
                id: 'a1'
            });
            const result = await service.submitQuiz({
                quizId: 'q1',
                answers: [
                    {
                        questionId: 'q1',
                        answer: 'A'
                    },
                    {
                        questionId: 'q2',
                        answer: 'B'
                    }
                ]
            }, 'user-1');
            expect(result.passed).toBe(true);
            expect(result.score).toBe(100);
        });
        it('should throw NotFoundException if quiz not found', async ()=>{
            mockPrisma.quiz.findUnique.mockResolvedValue(null);
            await expect(service.submitQuiz({
                quizId: 'bad',
                answers: []
            }, 'u1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('getUserQuizAttempts', ()=>{
        it('should return attempts', async ()=>{
            mockPrisma.quizAttempt.findMany.mockResolvedValue([
                {
                    id: 'a1'
                }
            ]);
            const result = await service.getUserQuizAttempts('u1', 'q1');
            expect(mockPrisma.quizAttempt.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 'u1',
                    quizId: 'q1'
                },
                orderBy: {
                    completedAt: 'desc'
                }
            });
            expect(result).toEqual([
                {
                    id: 'a1'
                }
            ]);
        });
    });
    describe('generateCertificate', ()=>{
        it('should generate certificate for completed course', async ()=>{
            mockPrisma.enrollment.findFirst.mockResolvedValue({
                id: 'e1',
                status: 'COMPLETED'
            });
            _crypto.randomUUID.mockReturnValue('uuid-123');
            _crypto.createHash.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    digest: jest.fn().mockReturnValue('hash-123')
                })
            });
            mockPrisma.certificate.create.mockResolvedValue({
                id: 'cert-1',
                certificateUid: 'uuid-123',
                verificationUrl: 'https://tilearning.net/verify/uuid-123',
                qrCodeHash: 'hash-123',
                user: {},
                course: {}
            });
            const result = await service.generateCertificate('user-1', 'course-1');
            expect(mockPrisma.enrollment.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    courseId: 'course-1',
                    status: 'COMPLETED'
                }
            });
            expect(_crypto.randomUUID).toHaveBeenCalled();
            expect(result).toEqual({
                id: 'cert-1',
                certificateUid: 'uuid-123',
                verificationUrl: 'https://tilearning.net/verify/uuid-123',
                qrCodeHash: 'hash-123',
                user: {},
                course: {}
            });
        });
        it('should throw BadRequestException if course not completed', async ()=>{
            mockPrisma.enrollment.findFirst.mockResolvedValue(null);
            await expect(service.generateCertificate('user-1', 'course-1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('getUserCertificates', ()=>{
        it('should return non-revoked certificates', async ()=>{
            mockPrisma.certificate.findMany.mockResolvedValue([
                {
                    id: 'c1'
                }
            ]);
            const result = await service.getUserCertificates('user-1');
            expect(mockPrisma.certificate.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
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
            expect(result).toEqual([
                {
                    id: 'c1'
                }
            ]);
        });
    });
    describe('verifyCertificate', ()=>{
        it('should return valid certificate', async ()=>{
            const cert = {
                id: 'c1',
                certificateUid: 'uid',
                revokedAt: null,
                user: {},
                course: {}
            };
            mockPrisma.certificate.findUnique.mockResolvedValue(cert);
            const result = await service.verifyCertificate('uid');
            expect(mockPrisma.certificate.findUnique).toHaveBeenCalledWith({
                where: {
                    certificateUid: 'uid'
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
            expect(result).toEqual({
                valid: true,
                ...cert
            });
        });
        it('should throw NotFoundException if revoked', async ()=>{
            mockPrisma.certificate.findUnique.mockResolvedValue({
                id: 'c1',
                revokedAt: new Date()
            });
            await expect(service.verifyCertificate('uid')).rejects.toThrow(_common.NotFoundException);
        });
        it('should throw NotFoundException if not found', async ()=>{
            mockPrisma.certificate.findUnique.mockResolvedValue(null);
            await expect(service.verifyCertificate('unknown')).rejects.toThrow(_common.NotFoundException);
        });
    });
});

//# sourceMappingURL=learning.service.spec.js.map