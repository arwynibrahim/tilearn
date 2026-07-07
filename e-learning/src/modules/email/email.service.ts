import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;
  private host: string;
  private port: number;
  private secure: boolean;

  constructor(private configService: ConfigService) {
    this.from = this.configService.get<string>('SMTP_FROM', 'Total Innovation Learning <noreply@tilearning.net>')!;

    // Env vars are strings — coerce explicitly. nodemailer's `secure` uses `!!value`,
    // so the string "false" would wrongly enable SSL. Parse it properly, and default
    // `secure` to true for port 465 (implicit SSL) / false otherwise (STARTTLS).
    this.host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com')!;
    this.port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const secureRaw = this.configService.get<string>('SMTP_SECURE');
    this.secure = secureRaw !== undefined ? secureRaw.toLowerCase() === 'true' : this.port === 465;

    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      // Fail fast with a clear error instead of hanging ~2 min on a blocked/wrong host
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  // Verify SMTP config at startup so a bad setup is obvious in the Railway logs,
  // instead of only surfacing when the first email (org welcome, reset…) fails.
  async onModuleInit() {
    if (!this.configService.get<string>('SMTP_USER')) {
      this.logger.warn('SMTP non configuré (SMTP_USER absent) — les emails ne seront pas envoyés.');
      return;
    }
    try {
      await this.transporter.verify();
      this.logger.log(`SMTP prêt (${this.host}:${this.port}, secure=${this.secure})`);
    } catch (err) {
      this.logger.error(
        `Connexion SMTP impossible (${this.host}:${this.port}, secure=${this.secure}): ${err}. ` +
        'Vérifier SMTP_HOST/PORT/SECURE/USER/PASS. Railway bloque parfois le port 465 — essayer 587 + SMTP_SECURE=false.',
      );
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(to: string, prenom: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    await this.sendMail(
      to,
      'Bienvenue sur Total Innovation Learning 🎉',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E8650A 0%, #C45408 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Total Innovation Learning</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Bienvenue ${prenom} !</h2>
          <p>Votre compte a bien été créé. Vous pouvez dès maintenant explorer notre catalogue de cours,
             suivre des modules interactifs (vidéo, VR, quiz) et obtenir vos certificats.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard"
               style="background: #E8650A; color: white; padding: 14px 28px; text-decoration: none;
                      border-radius: 5px; font-size: 16px; display: inline-block;">
              Accéder à mon espace
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Total Innovation Learning
        </div>
      </div>
      `,
    );
  }

  async sendOrganizationWelcomeEmail(
    to: string,
    prenom: string,
    organizationName: string,
    loginEmail: string,
    password: string,
  ) {
    await this.sendMail(
      to,
      `Bienvenue sur Total Innovation Learning - Accès ${organizationName}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E8650A 0%, #C45408 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Total Innovation Learning</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Organisation créée avec succès</h2>
          <p>Bonjour ${prenom},</p>
          <p>Votre organisation <strong>${organizationName}</strong> a été créée sur Total Innovation Learning.</p>
          <p>Voici vos identifiants de connexion :</p>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Email :</strong> ${loginEmail}</p>
            <p style="margin: 0;"><strong>Mot de passe :</strong> ${password}</p>
          </div>
          <p style="color: #999; font-size: 13px;">Nous vous recommandons de changer ce mot de passe lors de votre première connexion.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/login"
               style="background: #E8650A; color: white; padding: 14px 28px; text-decoration: none;
                      border-radius: 5px; font-size: 16px; display: inline-block;">
              Accéder à mon tableau de bord
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Total Innovation Learning
        </div>
      </div>
      `,
    );
  }

  async sendPasswordResetEmail(to: string, token: string, frontendUrl: string) {
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendMail(
      to,
      'Réinitialisation de votre mot de passe - Total Innovation Learning',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Total Innovation Learning</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none;
                      border-radius: 5px; font-size: 16px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure.</p>
          <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Total Innovation Learning
        </div>
      </div>
      `,
    );
  }
}
