import {
  Injectable, Logger, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
        interests: dto.interests || [],
      },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    // New users always start as INDIVIDUAL LEARNER
    await this.prisma.membership.create({
      data: { userId: user.id, contextType: 'INDIVIDUAL', role: 'LEARNER' },
    });

    // Best-effort welcome email — never block registration on SMTP failure
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.prenom);
    } catch (err) {
      this.logger.warn(`Échec de l'envoi de l'email de bienvenue à ${user.email}: ${err}`);
    }

    const tokens = await this.generateTokens(user);
    return {
      user: { ...user, memberships: [{ contextType: 'INDIVIDUAL' as const, contextId: null, role: 'LEARNER' as const }] },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true, email: true, passwordHash: true, nom: true, prenom: true,
        memberships: { select: { contextType: true, contextId: true, role: true } },
      },
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

    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const passwordHash = await hash(dto.password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(user: { id: string; email: string }) {
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

      await this.prisma.membership.create({
        data: { userId: user.id, contextType: 'INDIVIDUAL', role: 'LEARNER' },
      });

      // Welcome email only for freshly created OAuth accounts
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.prenom);
      } catch (err) {
        this.logger.warn(`Échec de l'envoi de l'email de bienvenue à ${user.email}: ${err}`);
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), avatar: oauthUser.avatar || user.avatar },
    });

    const tokens = await this.generateTokens({ id: user.id, email: user.email });

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
      select: { contextType: true, contextId: true, role: true },
    });

    return {
      user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, memberships },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        avatar: true, interests: true, emailVerifiedAt: true,
        lastLoginAt: true, createdAt: true,
        memberships: { select: { contextType: true, contextId: true, role: true } },
      },
    });
  }
}
