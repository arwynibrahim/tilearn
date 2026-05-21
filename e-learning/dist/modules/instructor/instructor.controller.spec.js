"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _instructorcontroller = require("./instructor.controller");
const _instructorservice = require("./instructor.service");
const mockInstructorService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getInstructorCourses: jest.fn(),
    getInstructorStats: jest.fn(),
    createReview: jest.fn(),
    getCourseReviews: jest.fn()
};
describe('InstructorController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _instructorcontroller.InstructorController
            ],
            providers: [
                {
                    provide: _instructorservice.InstructorService,
                    useValue: mockInstructorService
                }
            ]
        }).compile();
        controller = module.get(_instructorcontroller.InstructorController);
        jest.clearAllMocks();
    });
    it('getProfile', async ()=>{
        mockInstructorService.getProfile.mockResolvedValue({
            id: 'p1'
        });
        expect(await controller.getProfile('user-1')).toEqual({
            id: 'p1'
        });
        expect(mockInstructorService.getProfile).toHaveBeenCalledWith('user-1');
    });
    it('updateProfile', async ()=>{
        const data = {
            bio: 'New bio'
        };
        mockInstructorService.updateProfile.mockResolvedValue({
            id: 'p1',
            bio: 'New bio'
        });
        expect(await controller.updateProfile('user-1', data)).toEqual({
            id: 'p1',
            bio: 'New bio'
        });
        expect(mockInstructorService.updateProfile).toHaveBeenCalledWith('user-1', data);
    });
    it('getInstructorCourses', async ()=>{
        mockInstructorService.getInstructorCourses.mockResolvedValue([]);
        expect(await controller.getInstructorCourses('user-1')).toEqual([]);
        expect(mockInstructorService.getInstructorCourses).toHaveBeenCalledWith('user-1');
    });
    it('getInstructorStats', async ()=>{
        mockInstructorService.getInstructorStats.mockResolvedValue({
            totalCourses: 2,
            totalEnrollments: 10,
            totalReviews: 5,
            averageRating: 4.2
        });
        const result = await controller.getInstructorStats('user-1');
        expect(mockInstructorService.getInstructorStats).toHaveBeenCalledWith('user-1');
        expect(result).toEqual({
            totalCourses: 2,
            totalEnrollments: 10,
            totalReviews: 5,
            averageRating: 4.2
        });
    });
    it('createReview', async ()=>{
        const dto = {
            courseId: 'c1',
            rating: 5
        };
        mockInstructorService.createReview.mockResolvedValue({
            id: 'r1'
        });
        expect(await controller.createReview(dto, 'user-1')).toEqual({
            id: 'r1'
        });
        expect(mockInstructorService.createReview).toHaveBeenCalledWith(dto, 'user-1');
    });
    it('getCourseReviews', async ()=>{
        mockInstructorService.getCourseReviews.mockResolvedValue([]);
        expect(await controller.getCourseReviews('c1')).toEqual([]);
        expect(mockInstructorService.getCourseReviews).toHaveBeenCalledWith('c1');
    });
});

//# sourceMappingURL=instructor.controller.spec.js.map