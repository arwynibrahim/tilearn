import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto & { providerReference?: string }, userId: string) {
    return this.prisma.payment.create({
      data: {
        transactionId: dto.transactionId,
        amount: dto.amount,
        currency: dto.currency || 'XOF',
        provider: dto.provider,
        status: dto.status || 'PENDING',
        paymentMethod: dto.paymentMethod,
        subscriptionId: dto.subscriptionId,
        providerReference: dto.providerReference,
        userId,
      },
    });
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(userId: string, plan: string) {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: plan as any,
        currentPeriodStart: now,
        currentPeriodEnd: end,
      },
    });
  }

  async getAllPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, nom: true, prenom: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);
    return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async refundPayment(transactionId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { transactionId } });
    if (!payment) throw new NotFoundException('Paiement non trouvé');
    if (payment.status !== 'SUCCESS') {
      throw new BadRequestException('Seuls les paiements réussis peuvent être remboursés');
    }
    return this.prisma.payment.update({
      where: { transactionId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });
  }
}
