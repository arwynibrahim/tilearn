import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { LigdiCashService } from './ligdicash/ligdicash.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

import * as crypto from 'crypto';

const mockPaymentService = {
  createPayment: jest.fn(),
  getUserPayments: jest.fn(),
  getUserSubscriptions: jest.fn(),
  createSubscription: jest.fn(),
  getAllPayments: jest.fn(),
};

const mockLigdicashService = {
  createPayin: jest.fn(),
};

const mockPrisma = {
  payment: { update: jest.fn() },
};

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: LigdiCashService, useValue: mockLigdicashService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should call paymentService.createPayment', async () => {
      const dto = { transactionId: 'T1', amount: 5000, provider: 'CINETPAY' as const };
      mockPaymentService.createPayment.mockResolvedValue({ id: 'p1' });

      const result = await controller.createPayment(dto, 'user-1');

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: 'p1' });
    });
  });

  describe('initiateLigdiCashPayin', () => {
    it('should initiate payin and return payment URL', async () => {
      const dto = { amount: 5000, customerPhone: '22670000000', customerFirstname: 'J', customerLastname: 'D', customerEmail: 'j@d.com' };
      const user = { id: 'u1', email: 'j@d.com', nom: 'D', prenom: 'J' };
      (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]));

      mockPaymentService.createPayment.mockResolvedValue({ id: 'p1' });
      mockLigdicashService.createPayin.mockResolvedValue({ paymentUrl: 'https://pay.url', token: 'tok-123' });
      mockPrisma.payment.update.mockResolvedValue({});

      const result = await controller.initiateLigdiCashPayin(dto, user);

      expect(mockPaymentService.createPayment).toHaveBeenCalled();
      expect(mockLigdicashService.createPayin).toHaveBeenCalledWith(expect.objectContaining({
        amount: 5000,
        currency: 'XOF',
        transactionId: expect.stringContaining('TIL-'),
      }));
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: expect.stringContaining('TIL-') },
        data: { providerReference: 'tok-123' },
      });
      expect(result).toEqual({
        transactionId: expect.stringContaining('TIL-'),
        paymentUrl: 'https://pay.url',
        token: 'tok-123',
        message: 'Redirigez l\'utilisateur vers paymentUrl',
      });
    });
  });

  describe('getUserPayments', () => {
    it('should call paymentService.getUserPayments', async () => {
      mockPaymentService.getUserPayments.mockResolvedValue([]);
      const result = await controller.getUserPayments('user-1');
      expect(mockPaymentService.getUserPayments).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('getUserSubscriptions', () => {
    it('should call paymentService.getUserSubscriptions', async () => {
      mockPaymentService.getUserSubscriptions.mockResolvedValue([]);
      const result = await controller.getUserSubscriptions('user-1');
      expect(mockPaymentService.getUserSubscriptions).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('createSubscription', () => {
    it('should call paymentService.createSubscription', async () => {
      mockPaymentService.createSubscription.mockResolvedValue({ id: 's1' });
      const result = await controller.createSubscription('user-1', 'PRO');
      expect(mockPaymentService.createSubscription).toHaveBeenCalledWith('user-1', 'PRO');
      expect(result).toEqual({ id: 's1' });
    });
  });

  describe('getAllPayments', () => {
    it('should call paymentService.getAllPayments', async () => {
      mockPaymentService.getAllPayments.mockResolvedValue({ payments: [], total: 0, page: 1, limit: 20, totalPages: 0 });
      const result = await controller.getAllPayments(1, 20);
      expect(mockPaymentService.getAllPayments).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual({ payments: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    });
  });
});
