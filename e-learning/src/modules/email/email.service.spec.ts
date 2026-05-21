import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  }),
}));

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                SMTP_FROM: 'Test <test@test.com>',
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: 587,
                SMTP_SECURE: false,
                SMTP_USER: 'user',
                SMTP_PASS: 'pass',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email', async () => {
      await service.sendPasswordResetEmail('user@test.com', 'reset-token-123', 'http://localhost:3001');

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport();
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Test <test@test.com>',
          to: 'user@test.com',
          subject: expect.stringContaining('Réinitialisation'),
          html: expect.stringContaining('reset-token-123'),
        }),
      );
    });
  });
});
