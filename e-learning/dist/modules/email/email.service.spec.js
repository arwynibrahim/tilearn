"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _config = require("@nestjs/config");
const _emailservice = require("./email.service");
jest.mock('nodemailer', ()=>({
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({
                messageId: 'mock-id'
            })
        })
    }));
describe('EmailService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _emailservice.EmailService,
                {
                    provide: _config.ConfigService,
                    useValue: {
                        get: jest.fn((key, defaultValue)=>{
                            const config = {
                                SMTP_FROM: 'Test <test@test.com>',
                                SMTP_HOST: 'smtp.test.com',
                                SMTP_PORT: 587,
                                SMTP_SECURE: false,
                                SMTP_USER: 'user',
                                SMTP_PASS: 'pass'
                            };
                            return config[key] ?? defaultValue;
                        })
                    }
                }
            ]
        }).compile();
        service = module.get(_emailservice.EmailService);
    });
    describe('sendPasswordResetEmail', ()=>{
        it('should send a password reset email', async ()=>{
            await service.sendPasswordResetEmail('user@test.com', 'reset-token-123', 'http://localhost:3001');
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport();
            expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                from: 'Test <test@test.com>',
                to: 'user@test.com',
                subject: expect.stringContaining('Réinitialisation'),
                html: expect.stringContaining('reset-token-123')
            }));
        });
    });
});

//# sourceMappingURL=email.service.spec.js.map