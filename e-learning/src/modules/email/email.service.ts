import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService) {
    this.from = this.configService.get<string>('SMTP_FROM', 'Total Innovation Learning <noreply@tilearning.net>')!;
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });
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
