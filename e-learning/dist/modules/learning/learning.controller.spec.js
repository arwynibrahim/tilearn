"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _learningcontroller = require("./learning.controller");
const _learningservice = require("./learning.service");
const mockLearningService = {
    enroll: jest.fn(),
    getUserEnrollments: jest.fn(),
    updateProgress: jest.fn(),
    getUserProgress: jest.fn(),
    submitQuiz: jest.fn(),
    getUserQuizAttempts: jest.fn(),
    generateCertificate: jest.fn(),
    getUserCertificates: jest.fn(),
    verifyCertificate: jest.fn()
};
describe('LearningController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _learningcontroller.LearningController
            ],
            providers: [
                {
                    provide: _learningservice.LearningService,
                    useValue: mockLearningService
                }
            ]
        }).compile();
        controller = module.get(_learningcontroller.LearningController);
        jest.clearAllMocks();
    });
    describe('enroll', ()=>{
        it('should call service.enroll', async ()=>{
            mockLearningService.enroll.mockResolvedValue({
                id: 'e1'
            });
            const result = await controller.enroll({
                courseId: 'c1'
            }, 'user-1');
            expect(mockLearningService.enroll).toHaveBeenCalledWith({
                courseId: 'c1'
            }, 'user-1');
            expect(result).toEqual({
                id: 'e1'
            });
        });
    });
    describe('getUserEnrollments', ()=>{
        it('should call service.getUserEnrollments', async ()=>{
            mockLearningService.getUserEnrollments.mockResolvedValue([]);
            const result = await controller.getUserEnrollments('user-1');
            expect(mockLearningService.getUserEnrollments).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([]);
        });
    });
    describe('updateProgress', ()=>{
        it('should call service.updateProgress', async ()=>{
            const dto = {
                status: 'COMPLETED'
            };
            mockLearningService.updateProgress.mockResolvedValue({
                id: 'p1'
            });
            const result = await controller.updateProgress('user-1', 'mod-1', dto);
            expect(mockLearningService.updateProgress).toHaveBeenCalledWith('user-1', 'mod-1', dto);
            expect(result).toEqual({
                id: 'p1'
            });
        });
    });
    describe('getUserProgress', ()=>{
        it('should call service.getUserProgress', async ()=>{
            mockLearningService.getUserProgress.mockResolvedValue({
                modules: [],
                stats: {}
            });
            const result = await controller.getUserProgress('user-1', 'course-1');
            expect(mockLearningService.getUserProgress).toHaveBeenCalledWith('user-1', 'course-1');
            expect(result).toEqual({
                modules: [],
                stats: {}
            });
        });
    });
    describe('submitQuiz', ()=>{
        it('should call service.submitQuiz', async ()=>{
            const dto = {
                quizId: 'q1',
                answers: []
            };
            mockLearningService.submitQuiz.mockResolvedValue({
                attempt: {},
                score: 100,
                passed: true,
                totalQuestions: 1,
                correctAnswers: 1
            });
            const result = await controller.submitQuiz(dto, 'user-1');
            expect(mockLearningService.submitQuiz).toHaveBeenCalledWith(dto, 'user-1');
            expect(result).toEqual({
                attempt: {},
                score: 100,
                passed: true,
                totalQuestions: 1,
                correctAnswers: 1
            });
        });
    });
    describe('getUserQuizAttempts', ()=>{
        it('should call service.getUserQuizAttempts', async ()=>{
            mockLearningService.getUserQuizAttempts.mockResolvedValue([]);
            const result = await controller.getUserQuizAttempts('user-1', 'q1');
            expect(mockLearningService.getUserQuizAttempts).toHaveBeenCalledWith('user-1', 'q1');
            expect(result).toEqual([]);
        });
    });
    describe('generateCertificate', ()=>{
        it('should call service.generateCertificate', async ()=>{
            mockLearningService.generateCertificate.mockResolvedValue({
                id: 'cert-1'
            });
            const result = await controller.generateCertificate('user-1', 'course-1');
            expect(mockLearningService.generateCertificate).toHaveBeenCalledWith('user-1', 'course-1');
            expect(result).toEqual({
                id: 'cert-1'
            });
        });
    });
    describe('getUserCertificates', ()=>{
        it('should call service.getUserCertificates', async ()=>{
            mockLearningService.getUserCertificates.mockResolvedValue([]);
            const result = await controller.getUserCertificates('user-1');
            expect(mockLearningService.getUserCertificates).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([]);
        });
    });
    describe('verifyCertificate', ()=>{
        it('should call service.verifyCertificate', async ()=>{
            mockLearningService.verifyCertificate.mockResolvedValue({
                valid: true,
                id: 'c1'
            });
            const result = await controller.verifyCertificate('uid-123');
            expect(mockLearningService.verifyCertificate).toHaveBeenCalledWith('uid-123');
            expect(result).toEqual({
                valid: true,
                id: 'c1'
            });
        });
    });
});

//# sourceMappingURL=learning.controller.spec.js.map