import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  payment: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  subscription: { create: jest.fn(), findMany: jest.fn() },
};

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const dto = { transactionId: 'TIL-123', amount: 5000, currency: 'XOF', provider: 'CINETPAY' as const, status: 'PENDING' as const };
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1', ...dto, userId: 'user-1' });

      const result = await service.createPayment(dto, 'user-1');

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'TIL-123',
          amount: 5000,
          currency: 'XOF',
          provider: 'CINETPAY',
          status: 'PENDING',
          paymentMethod: undefined,
          subscriptionId: undefined,
          providerReference: undefined,
          userId: 'user-1',
        },
      });
      expect(result).toEqual({ id: 'pay-1', ...dto, userId: 'user-1' });
    });

    it('should use defaults for optional fields', async () => {
      mockPrisma.payment.create.mockResolvedValue({ id: 'p1' });

      await service.createPayment({ transactionId: 'T1', amount: 1000, provider: 'CINETPAY' as const }, 'u1');

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'T1',
          amount: 1000,
          currency: 'XOF',
          provider: 'CINETPAY',
          status: 'PENDING',
          paymentMethod: undefined,
          subscriptionId: undefined,
          providerReference: undefined,
          userId: 'u1',
        },
      });
    });
  });

  describe('getUserPayments', () => {
    it('should return user payments', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([{ id: 'p1' }]);

      const result = await service.getUserPayments('user-1');

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 'p1' }]);
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([{ id: 's1' }]);

      const result = await service.getUserSubscriptions('user-1');

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 's1' }]);
    });
  });

  describe('createSubscription', () => {
    it('should create a monthly subscription', async () => {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);

      mockPrisma.subscription.create.mockResolvedValue({ id: 's1', userId: 'u1', plan: 'PRO' });

      const result = await service.createSubscription('u1', 'PRO');

      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          plan: 'PRO',
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
        },
      });
      expect(result).toEqual({ id: 's1', userId: 'u1', plan: 'PRO' });
    });
  });

  describe('getAllPayments', () => {
    it('should return paginated payments', async () => {
      const payments = [{ id: 'p1', user: { id: 'u1', email: 'test@test.com', nom: 'D', prenom: 'J' } }];
      mockPrisma.payment.findMany.mockResolvedValue(payments);
      mockPrisma.payment.count.mockResolvedValue(1);

      const result = await service.getAllPayments(1, 20);

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        include: { user: { select: { id: true, email: true, nom: true, prenom: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({ payments, total: 1, page: 1, limit: 20, totalPages: 1 });
    });
  });
});
