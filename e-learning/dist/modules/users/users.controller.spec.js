"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _userscontroller = require("./users.controller");
const _usersservice = require("./users.service");
const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
};
describe('UsersController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _userscontroller.UsersController
            ],
            providers: [
                {
                    provide: _usersservice.UsersService,
                    useValue: mockUsersService
                }
            ]
        }).compile();
        controller = module.get(_userscontroller.UsersController);
        jest.clearAllMocks();
    });
    describe('findAll', ()=>{
        it('should return paginated users with default params', async ()=>{
            const expected = {
                users: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0
            };
            mockUsersService.findAll.mockResolvedValue(expected);
            const result = await controller.findAll(1, 20);
            expect(mockUsersService.findAll).toHaveBeenCalledWith(1, 20);
            expect(result).toEqual(expected);
        });
        it('should convert query params to numbers', async ()=>{
            await controller.findAll('2', '10');
            expect(mockUsersService.findAll).toHaveBeenCalledWith(2, 10);
        });
    });
    describe('findOne', ()=>{
        it('should return a user', async ()=>{
            const user = {
                id: 'user-1',
                email: 'test@test.com'
            };
            mockUsersService.findOne.mockResolvedValue(user);
            const result = await controller.findOne('user-1');
            expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
            expect(result).toEqual(user);
        });
    });
    describe('update', ()=>{
        it('should update a user', async ()=>{
            const dto = {
                nom: 'Updated'
            };
            const updated = {
                id: 'user-1',
                nom: 'Updated'
            };
            mockUsersService.update.mockResolvedValue(updated);
            const result = await controller.update('user-1', dto);
            expect(mockUsersService.update).toHaveBeenCalledWith('user-1', dto);
            expect(result).toEqual(updated);
        });
    });
    describe('remove', ()=>{
        it('should remove a user', async ()=>{
            mockUsersService.remove.mockResolvedValue({
                message: 'Utilisateur supprimé'
            });
            const result = await controller.remove('user-1');
            expect(mockUsersService.remove).toHaveBeenCalledWith('user-1');
            expect(result).toEqual({
                message: 'Utilisateur supprimé'
            });
        });
    });
});

//# sourceMappingURL=users.controller.spec.js.map