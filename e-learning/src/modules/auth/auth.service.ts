import {
  Injectable, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RolePermissions } from '../roles/permissions';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const passwordHash = await hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nom: dto.nom,
        prenom: dto.prenom,
        telephone: dto.telephone,
        role: dto.role || 'LEARNER',
      },
      select: { id: true, email: true, nom: true, prenom: true, role: true },
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, passwordHash: true, nom: true, prenom: true, role: true },
    });

    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash, ...safeUser } = user;
    const tokens = await this.generateTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');

    await this.emailService.sendPasswordResetEmail(user.email, resetToken, frontendUrl);

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiresAt: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const passwordHash = await hash(dto.password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async generateTokens(user: { id: string; email: string; role: string }) {
    const permissions = RolePermissions[user.role] || [];
    const payload = { sub: user.id, email: user.email, role: user.role, permissions };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(user: { id: string; email: string; role: string }) {
    return this.generateTokens(user);
  }

  async loginOrRegisterOAuth(oauthUser: {
    email: string;
    nom: string;
    prenom: string;
    avatar?: string;
    provider: string;
    providerId: string;
  }) {
    if (!oauthUser.email) {
      throw new UnauthorizedException('Email requis pour l\'authentification OAuth');
    }

    let user = await this.prisma.user.findUnique({ where: { email: oauthUser.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          passwordHash: '',
          nom: oauthUser.nom || '',
          prenom: oauthUser.prenom || '',
          avatar: oauthUser.avatar,
          emailVerifiedAt: new Date(),
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), avatar: oauthUser.avatar || user.avatar },
    });

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        avatar: true, role: true, emailVerifiedAt: true, lastLoginAt: true,
        createdAt: true,
      },
    });
  }
}
