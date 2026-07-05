import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  membership: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      email: 'test@test.com',
      password: 'password123',
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+33612345678',
      interests: ['Développement', 'Santé'],
    };

    it('should register a new user and create INDIVIDUAL LEARNER membership', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        nom: 'Dupont',
        prenom: 'Jean',
      });
      mockPrisma.membership.create.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.register(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@test.com',
          passwordHash: 'hashed-password',
          nom: 'Dupont',
          prenom: 'Jean',
          telephone: '+33612345678',
          interests: ['Développement', 'Santé'],
        },
        select: { id: true, email: true, nom: true, prenom: true },
      });
      expect(mockPrisma.membership.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', contextType: 'INDIVIDUAL', role: 'LEARNER' },
      });
      expect(result.user).toEqual({
        id: 'user-1', email: 'test@test.com', nom: 'Dupont', prenom: 'Jean',
        memberships: [{ contextType: 'INDIVIDUAL', contextId: null, role: 'LEARNER' }],
      });
      expect(result.accessToken).toBe('token');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };
    const memberships = [{ contextType: 'INDIVIDUAL', contextId: null, role: 'LEARNER' }];
    const user = {
      id: 'user-1',
      email: 'test@test.com',
      passwordHash: 'hashed-password',
      nom: 'Dupont',
      prenom: 'Jean',
      memberships,
    };

    it('should login successfully and include memberships', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        select: {
          id: true, email: true, passwordHash: true, nom: true, prenom: true,
          memberships: { select: { contextType: true, contextId: true, role: true } },
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(result.user).toEqual({
        id: 'user-1', email: 'test@test.com', nom: 'Dupont', prenom: 'Jean', memberships,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email if user exists', async () => {
      const user = { id: 'user-1', email: 'test@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockConfigService.get.mockReturnValue('http://localhost:3001');
      const mockBuffer = { toString: () => 'a'.repeat(64) };
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);

      const result = await service.forgotPassword({ email: 'test@test.com' });

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          resetToken: 'a'.repeat(64),
          resetTokenExpiresAt: expect.any(Date),
        },
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@test.com',
        'a'.repeat(64),
        'http://localhost:3001',
      );
      expect(result.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
    });

    it('should return same message if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'unknown@test.com' });

      expect(result.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = { id: 'user-1' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.resetPassword({ token: 'valid-token', password: 'newpass123' });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'valid-token',
          resetTokenExpiresAt: { gte: expect.any(Date) },
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'new-hash', resetToken: null, resetTokenExpiresAt: null },
      });
      expect(result.message).toBe('Mot de passe réinitialisé avec succès');
    });

    it('should throw BadRequestException if token invalid or expired', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad-token', password: 'newpass123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens with only sub and email', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const user = { id: 'user-1', email: 'test@test.com' };
      const result = await service.generateTokens(user);

      const expectedPayload = { sub: 'user-1', email: 'test@test.com' };

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, expectedPayload, { expiresIn: '15m' });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, expectedPayload, { expiresIn: '7d' });
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });
  });

  describe('refreshToken', () => {
    it('should call generateTokens with user', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const user = { id: 'user-1', email: 'test@test.com' };
      const result = await service.refreshToken(user);

      expect(result).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    });
  });

  describe('loginOrRegisterOAuth', () => {
    const oauthUser = {
      email: 'oauth@test.com',
      nom: 'Smith',
      prenom: 'John',
      avatar: 'http://avatar.com/pic.jpg',
      provider: 'google',
      providerId: 'google-123',
    };

    it('should login existing OAuth user', async () => {
      const existingUser = {
        id: 'user-1', email: 'oauth@test.com', nom: 'Smith', prenom: 'John',
        avatar: null, passwordHash: '',
      };
      const memberships = [{ contextType: 'INDIVIDUAL', contextId: null, role: 'LEARNER' }];
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(existingUser);
      mockPrisma.membership.findMany.mockResolvedValue(memberships);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.loginOrRegisterOAuth(oauthUser);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'oauth@test.com' } });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { lastLoginAt: expect.any(Date), avatar: 'http://avatar.com/pic.jpg' },
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.user.memberships).toEqual(memberships);
    });

    it('should create new user with INDIVIDUAL LEARNER membership if not exists', async () => {
      const newUser = {
        id: 'user-2', email: 'oauth@test.com', nom: 'Smith', prenom: 'John',
        avatar: 'http://avatar.com/pic.jpg', passwordHash: '',
      };
      const memberships = [{ contextType: 'INDIVIDUAL', contextId: null, role: 'LEARNER' }];
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockPrisma.membership.create.mockResolvedValue({});
      mockPrisma.membership.findMany.mockResolvedValue(memberships);
      mockPrisma.user.update.mockResolvedValue(newUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.loginOrRegisterOAuth(oauthUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'oauth@test.com',
          passwordHash: '',
          nom: 'Smith',
          prenom: 'John',
          avatar: 'http://avatar.com/pic.jpg',
          emailVerifiedAt: expect.any(Date),
        },
      });
      expect(mockPrisma.membership.create).toHaveBeenCalledWith({
        data: { userId: 'user-2', contextType: 'INDIVIDUAL', role: 'LEARNER' },
      });
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException if no email provided', async () => {
      await expect(
        service.loginOrRegisterOAuth({ ...oauthUser, email: '' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile with memberships', async () => {
      const profile = {
        id: 'user-1', email: 'test@test.com', nom: 'Dupont', prenom: 'Jean',
        telephone: '+33612345678', avatar: null,
        interests: [], emailVerifiedAt: null, lastLoginAt: null, createdAt: new Date(),
        memberships: [{ contextType: 'INDIVIDUAL', contextId: null, role: 'LEARNER' }],
      };
      mockPrisma.user.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true, email: true, nom: true, prenom: true, telephone: true,
          avatar: true, interests: true, emailVerifiedAt: true,
          lastLoginAt: true, createdAt: true,
          memberships: { select: { contextType: true, contextId: true, role: true } },
        },
      });
      expect(result).toEqual(profile);
    });
  });
});
