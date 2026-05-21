"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    refreshToken: jest.fn(),
    getProfile: jest.fn()
};
describe('AuthController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _authcontroller.AuthController
            ],
            providers: [
                {
                    provide: _authservice.AuthService,
                    useValue: mockAuthService
                }
            ]
        }).compile();
        controller = module.get(_authcontroller.AuthController);
        jest.clearAllMocks();
    });
    describe('register', ()=>{
        it('should call authService.register with dto', async ()=>{
            const dto = {
                email: 'test@test.com',
                password: 'password123',
                nom: 'Dupont',
                prenom: 'Jean'
            };
            const expected = {
                user: {
                    id: '1'
                },
                accessToken: 'at',
                refreshToken: 'rt'
            };
            mockAuthService.register.mockResolvedValue(expected);
            const result = await controller.register(dto);
            expect(mockAuthService.register).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });
    describe('login', ()=>{
        it('should call authService.login with dto', async ()=>{
            const dto = {
                email: 'test@test.com',
                password: 'pass'
            };
            const expected = {
                user: {
                    id: '1'
                },
                accessToken: 'at',
                refreshToken: 'rt'
            };
            mockAuthService.login.mockResolvedValue(expected);
            const result = await controller.login(dto);
            expect(mockAuthService.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });
    describe('forgotPassword', ()=>{
        it('should call authService.forgotPassword with dto', async ()=>{
            const dto = {
                email: 'test@test.com'
            };
            mockAuthService.forgotPassword.mockResolvedValue({
                message: 'Email sent'
            });
            const result = await controller.forgotPassword(dto);
            expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                message: 'Email sent'
            });
        });
    });
    describe('resetPassword', ()=>{
        it('should call authService.resetPassword with dto', async ()=>{
            const dto = {
                token: 'tok',
                password: 'newpass123'
            };
            mockAuthService.resetPassword.mockResolvedValue({
                message: 'Password reset'
            });
            const result = await controller.resetPassword(dto);
            expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                message: 'Password reset'
            });
        });
    });
    describe('refresh', ()=>{
        it('should call authService.refreshToken with user', async ()=>{
            const user = {
                id: 'user-1',
                email: 'test@test.com',
                role: 'LEARNER'
            };
            mockAuthService.refreshToken.mockResolvedValue({
                accessToken: 'at',
                refreshToken: 'rt'
            });
            const result = await controller.refresh(user);
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(user);
            expect(result).toEqual({
                accessToken: 'at',
                refreshToken: 'rt'
            });
        });
    });
    describe('getProfile', ()=>{
        it('should call authService.getProfile with user id', async ()=>{
            const profile = {
                id: 'user-1',
                email: 'test@test.com'
            };
            mockAuthService.getProfile.mockResolvedValue(profile);
            const result = await controller.getProfile('user-1');
            expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
            expect(result).toEqual(profile);
        });
    });
});

//# sourceMappingURL=auth.controller.spec.js.map