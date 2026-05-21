"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _config = require("@nestjs/config");
const _authservice = require("./auth.service");
const _prismaservice = require("../../prisma/prisma.service");
const _emailservice = require("../email/email.service");
const _permissions = require("../roles/permissions");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
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
jest.mock('bcryptjs', ()=>({
        hash: jest.fn(),
        compare: jest.fn()
    }));
jest.mock('crypto', ()=>({
        randomBytes: jest.fn()
    }));
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    }
};
const mockJwtService = {
    signAsync: jest.fn()
};
const mockConfigService = {
    get: jest.fn()
};
const mockEmailService = {
    sendPasswordResetEmail: jest.fn()
};
describe('AuthService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _authservice.AuthService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                },
                {
                    provide: _jwt.JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: _config.ConfigService,
                    useValue: mockConfigService
                },
                {
                    provide: _emailservice.EmailService,
                    useValue: mockEmailService
                }
            ]
        }).compile();
        service = module.get(_authservice.AuthService);
        jest.clearAllMocks();
    });
    describe('register', ()=>{
        const dto = {
            email: 'test@test.com',
            password: 'password123',
            nom: 'Dupont',
            prenom: 'Jean',
            telephone: '+33612345678',
            role: 'LEARNER'
        };
        it('should register a new user successfully', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            _bcryptjs.hash.mockResolvedValue('hashed-password');
            mockPrisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                nom: 'Dupont',
                prenom: 'Jean',
                role: 'LEARNER'
            });
            mockJwtService.signAsync.mockResolvedValue('token');
            const result = await service.register(dto);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: 'test@test.com'
                }
            });
            expect(_bcryptjs.hash).toHaveBeenCalledWith('password123', 12);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@test.com',
                    passwordHash: 'hashed-password',
                    nom: 'Dupont',
                    prenom: 'Jean',
                    telephone: '+33612345678',
                    role: 'LEARNER'
                },
                select: {
                    id: true,
                    email: true,
                    nom: true,
                    prenom: true,
                    role: true
                }
            });
            expect(result).toEqual({
                user: {
                    id: 'user-1',
                    email: 'test@test.com',
                    nom: 'Dupont',
                    prenom: 'Jean',
                    role: 'LEARNER'
                },
                accessToken: 'token',
                refreshToken: 'token'
            });
        });
        it('should throw ConflictException if email already exists', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'existing'
            });
            await expect(service.register(dto)).rejects.toThrow(_common.ConflictException);
        });
    });
    describe('login', ()=>{
        const dto = {
            email: 'test@test.com',
            password: 'password123'
        };
        const user = {
            id: 'user-1',
            email: 'test@test.com',
            passwordHash: 'hashed-password',
            nom: 'Dupont',
            prenom: 'Jean',
            role: 'LEARNER'
        };
        it('should login successfully', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(user);
            _bcryptjs.compare.mockResolvedValue(true);
            mockPrisma.user.update.mockResolvedValue(user);
            mockJwtService.signAsync.mockResolvedValue('token');
            const result = await service.login(dto);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: 'test@test.com'
                },
                select: {
                    id: true,
                    email: true,
                    passwordHash: true,
                    nom: true,
                    prenom: true,
                    role: true
                }
            });
            expect(_bcryptjs.compare).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                data: {
                    lastLoginAt: expect.any(Date)
                }
            });
            expect(result.user).toEqual({
                id: 'user-1',
                email: 'test@test.com',
                nom: 'Dupont',
                prenom: 'Jean',
                role: 'LEARNER'
            });
        });
        it('should throw UnauthorizedException if user not found', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.login(dto)).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should throw UnauthorizedException if password is wrong', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(user);
            _bcryptjs.compare.mockResolvedValue(false);
            await expect(service.login(dto)).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    describe('forgotPassword', ()=>{
        it('should send reset email if user exists', async ()=>{
            const user = {
                id: 'user-1',
                email: 'test@test.com'
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockConfigService.get.mockReturnValue('http://localhost:3001');
            const mockBuffer = {
                toString: ()=>'a'.repeat(64)
            };
            _crypto.randomBytes.mockReturnValue(mockBuffer);
            const result = await service.forgotPassword({
                email: 'test@test.com'
            });
            expect(_crypto.randomBytes).toHaveBeenCalledWith(32);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                data: {
                    resetToken: 'a'.repeat(64),
                    resetTokenExpiresAt: expect.any(Date)
                }
            });
            expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com', 'a'.repeat(64), 'http://localhost:3001');
            expect(result.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
        });
        it('should return same message if user does not exist', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const result = await service.forgotPassword({
                email: 'unknown@test.com'
            });
            expect(result.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });
    });
    describe('resetPassword', ()=>{
        it('should reset password successfully', async ()=>{
            const user = {
                id: 'user-1'
            };
            mockPrisma.user.findFirst.mockResolvedValue(user);
            _bcryptjs.hash.mockResolvedValue('new-hash');
            const result = await service.resetPassword({
                token: 'valid-token',
                password: 'newpass123'
            });
            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    resetToken: 'valid-token',
                    resetTokenExpiresAt: {
                        gte: expect.any(Date)
                    }
                }
            });
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                data: {
                    passwordHash: 'new-hash',
                    resetToken: null,
                    resetTokenExpiresAt: null
                }
            });
            expect(result.message).toBe('Mot de passe réinitialisé avec succès');
        });
        it('should throw BadRequestException if token invalid or expired', async ()=>{
            mockPrisma.user.findFirst.mockResolvedValue(null);
            await expect(service.resetPassword({
                token: 'bad-token',
                password: 'newpass123'
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('generateTokens', ()=>{
        it('should generate access and refresh tokens', async ()=>{
            mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            const user = {
                id: 'user-1',
                email: 'test@test.com',
                role: 'LEARNER'
            };
            const result = await service.generateTokens(user);
            const expectedPayload = {
                sub: 'user-1',
                email: 'test@test.com',
                role: 'LEARNER',
                permissions: _permissions.RolePermissions['LEARNER']
            };
            expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, expectedPayload, {
                expiresIn: '15m'
            });
            expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, expectedPayload, {
                expiresIn: '7d'
            });
            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            });
        });
    });
    describe('refreshToken', ()=>{
        it('should call generateTokens with user', async ()=>{
            mockJwtService.signAsync.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');
            const user = {
                id: 'user-1',
                email: 'test@test.com',
                role: 'LEARNER'
            };
            const result = await service.refreshToken(user);
            expect(result).toEqual({
                accessToken: 'new-access',
                refreshToken: 'new-refresh'
            });
        });
    });
    describe('loginOrRegisterOAuth', ()=>{
        const oauthUser = {
            email: 'oauth@test.com',
            nom: 'Smith',
            prenom: 'John',
            avatar: 'http://avatar.com/pic.jpg',
            provider: 'google',
            providerId: 'google-123'
        };
        it('should login existing OAuth user', async ()=>{
            const existingUser = {
                id: 'user-1',
                email: 'oauth@test.com',
                nom: 'Smith',
                prenom: 'John',
                role: 'LEARNER',
                avatar: null,
                passwordHash: ''
            };
            mockPrisma.user.findUnique.mockResolvedValue(existingUser);
            mockPrisma.user.update.mockResolvedValue(existingUser);
            mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            const result = await service.loginOrRegisterOAuth(oauthUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    email: 'oauth@test.com'
                }
            });
            expect(mockPrisma.user.create).not.toHaveBeenCalled();
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                data: {
                    lastLoginAt: expect.any(Date),
                    avatar: 'http://avatar.com/pic.jpg'
                }
            });
            expect(result.accessToken).toBe('access-token');
        });
        it('should create new user if not exists', async ()=>{
            const newUser = {
                id: 'user-2',
                email: 'oauth@test.com',
                nom: 'Smith',
                prenom: 'John',
                role: 'LEARNER',
                avatar: 'http://avatar.com/pic.jpg',
                passwordHash: ''
            };
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(newUser);
            mockPrisma.user.update.mockResolvedValue(newUser);
            mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
            const result = await service.loginOrRegisterOAuth(oauthUser);
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'oauth@test.com',
                    passwordHash: '',
                    nom: 'Smith',
                    prenom: 'John',
                    avatar: 'http://avatar.com/pic.jpg',
                    emailVerifiedAt: expect.any(Date)
                }
            });
            expect(result.accessToken).toBe('access-token');
        });
        it('should throw UnauthorizedException if no email provided', async ()=>{
            await expect(service.loginOrRegisterOAuth({
                ...oauthUser,
                email: ''
            })).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    describe('getProfile', ()=>{
        it('should return user profile', async ()=>{
            const profile = {
                id: 'user-1',
                email: 'test@test.com',
                nom: 'Dupont',
                prenom: 'Jean',
                telephone: '+33612345678',
                avatar: null,
                role: 'LEARNER',
                emailVerifiedAt: null,
                lastLoginAt: null,
                createdAt: new Date()
            };
            mockPrisma.user.findUnique.mockResolvedValue(profile);
            const result = await service.getProfile('user-1');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'user-1'
                },
                select: {
                    id: true,
                    email: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    avatar: true,
                    role: true,
                    emailVerifiedAt: true,
                    lastLoginAt: true,
                    createdAt: true
                }
            });
            expect(result).toEqual(profile);
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map