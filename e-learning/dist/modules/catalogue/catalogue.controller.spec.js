"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _cataloguecontroller = require("./catalogue.controller");
const _catalogueservice = require("./catalogue.service");
const mockCatalogueService = {
    createDomain: jest.fn(),
    findAllDomains: jest.fn(),
    findOneDomain: jest.fn(),
    createCourse: jest.fn(),
    findAllCourses: jest.fn(),
    findOneCourse: jest.fn(),
    updateCourse: jest.fn(),
    removeCourse: jest.fn(),
    createModule: jest.fn(),
    findModulesByCourse: jest.fn(),
    updateModule: jest.fn()
};
describe('CatalogueController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _cataloguecontroller.CatalogueController
            ],
            providers: [
                {
                    provide: _catalogueservice.CatalogueService,
                    useValue: mockCatalogueService
                }
            ]
        }).compile();
        controller = module.get(_cataloguecontroller.CatalogueController);
        jest.clearAllMocks();
    });
    describe('createDomain', ()=>{
        it('should call catalogueService.createDomain', async ()=>{
            const dto = {
                name: 'Dev',
                slug: 'dev'
            };
            mockCatalogueService.createDomain.mockResolvedValue({
                id: 'd1',
                ...dto
            });
            const result = await controller.createDomain(dto);
            expect(mockCatalogueService.createDomain).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                id: 'd1',
                ...dto
            });
        });
    });
    describe('findAllDomains', ()=>{
        it('should return all domains', async ()=>{
            const domains = [
                {
                    id: 'd1',
                    name: 'Dev'
                }
            ];
            mockCatalogueService.findAllDomains.mockResolvedValue(domains);
            const result = await controller.findAllDomains();
            expect(result).toEqual(domains);
        });
    });
    describe('findOneDomain', ()=>{
        it('should return a domain by id', async ()=>{
            const domain = {
                id: 'd1',
                name: 'Dev'
            };
            mockCatalogueService.findOneDomain.mockResolvedValue(domain);
            const result = await controller.findOneDomain('d1');
            expect(mockCatalogueService.findOneDomain).toHaveBeenCalledWith('d1');
            expect(result).toEqual(domain);
        });
    });
    describe('createCourse', ()=>{
        it('should call catalogueService.createCourse with dto and userId', async ()=>{
            const dto = {
                title: 'Course',
                domainId: 'd1'
            };
            const created = {
                id: 'c1',
                ...dto
            };
            mockCatalogueService.createCourse.mockResolvedValue(created);
            const result = await controller.createCourse(dto, 'user-1');
            expect(mockCatalogueService.createCourse).toHaveBeenCalledWith(dto, 'user-1');
            expect(result).toEqual(created);
        });
    });
    describe('findAllCourses', ()=>{
        it('should return courses with filters', async ()=>{
            const expected = {
                courses: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0
            };
            mockCatalogueService.findAllCourses.mockResolvedValue(expected);
            const result = await controller.findAllCourses(1, 20, 'd1', 'BEGINNER');
            expect(mockCatalogueService.findAllCourses).toHaveBeenCalledWith(1, 20, {
                domainId: 'd1',
                level: 'BEGINNER'
            });
            expect(result).toEqual(expected);
        });
        it('should convert query params and omit undefined filters', async ()=>{
            await controller.findAllCourses('2', '10', undefined, undefined);
            expect(mockCatalogueService.findAllCourses).toHaveBeenCalledWith(2, 10, {
                domainId: undefined,
                level: undefined
            });
        });
    });
    describe('findOneCourse', ()=>{
        it('should return a course by slug', async ()=>{
            const course = {
                id: 'c1',
                slug: 'mon-cours'
            };
            mockCatalogueService.findOneCourse.mockResolvedValue(course);
            const result = await controller.findOneCourse('mon-cours');
            expect(mockCatalogueService.findOneCourse).toHaveBeenCalledWith('mon-cours');
            expect(result).toEqual(course);
        });
    });
    describe('updateCourse', ()=>{
        it('should update a course', async ()=>{
            const dto = {
                title: 'Updated'
            };
            mockCatalogueService.updateCourse.mockResolvedValue({
                id: 'c1',
                title: 'Updated'
            });
            const result = await controller.updateCourse('c1', dto);
            expect(mockCatalogueService.updateCourse).toHaveBeenCalledWith('c1', dto);
            expect(result).toEqual({
                id: 'c1',
                title: 'Updated'
            });
        });
    });
    describe('removeCourse', ()=>{
        it('should unpublish a course', async ()=>{
            mockCatalogueService.removeCourse.mockResolvedValue({
                message: 'Cours dépublié'
            });
            const result = await controller.removeCourse('c1');
            expect(mockCatalogueService.removeCourse).toHaveBeenCalledWith('c1');
            expect(result).toEqual({
                message: 'Cours dépublié'
            });
        });
    });
    describe('createModule', ()=>{
        it('should create a module', async ()=>{
            const dto = {
                title: 'Module 1',
                type: 'VIDEO',
                courseId: 'c1'
            };
            mockCatalogueService.createModule.mockResolvedValue({
                id: 'm1',
                ...dto
            });
            const result = await controller.createModule(dto);
            expect(mockCatalogueService.createModule).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                id: 'm1',
                ...dto
            });
        });
    });
    describe('findModulesByCourse', ()=>{
        it('should return modules for a course', async ()=>{
            const modules = [
                {
                    id: 'm1'
                }
            ];
            mockCatalogueService.findModulesByCourse.mockResolvedValue(modules);
            const result = await controller.findModulesByCourse('c1');
            expect(mockCatalogueService.findModulesByCourse).toHaveBeenCalledWith('c1');
            expect(result).toEqual(modules);
        });
    });
    describe('updateModule', ()=>{
        it('should update a module', async ()=>{
            const dto = {
                title: 'Updated'
            };
            mockCatalogueService.updateModule.mockResolvedValue({
                id: 'm1',
                title: 'Updated'
            });
            const result = await controller.updateModule('m1', dto);
            expect(mockCatalogueService.updateModule).toHaveBeenCalledWith('m1', dto);
            expect(result).toEqual({
                id: 'm1',
                title: 'Updated'
            });
        });
    });
});

//# sourceMappingURL=catalogue.controller.spec.js.map