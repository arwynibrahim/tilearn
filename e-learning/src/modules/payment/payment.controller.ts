import {
  Controller, Get, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { LigdiCashService } from './ligdicash/ligdicash.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InitiatePayinDto } from './dto/initiate-payin.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { Role } from '../../common/enums/role.enum';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@ApiTags('Payment')
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private ligdicashService: LigdiCashService,
    private prisma: PrismaService,
  ) {}

  @Post('payments')
  @RequirePermissions(Permissions.PAYMENT_CREATE)
  @ApiOperation({ summary: 'Créer un paiement' })
  createPayment(@Body() dto: CreatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentService.createPayment(dto, userId);
  }

  @Post('payments/ligdicash/initiate')
  @RequirePermissions(Permissions.PAYMENT_CREATE)
  @ApiOperation({ summary: 'Initier un paiement LigdiCash avec redirection' })
  async initiateLigdiCashPayin(
    @Body() dto: InitiatePayinDto,
    @CurrentUser() user: { id: string; email: string; nom: string; prenom: string },
  ) {
    const transactionId = `TIL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const description = dto.description || 'Paiement Total Innovation Learning';

    await this.paymentService.createPayment({
      transactionId,
      amount: dto.amount,
      currency: dto.currency || 'XOF',
      provider: PaymentProvider.CINETPAY,
      status: PaymentStatus.PENDING,
    }, user.id);

    const result = await this.ligdicashService.createPayin({
      amount: dto.amount,
      currency: dto.currency || 'XOF',
      description,
      customerPhone: dto.customerPhone,
      customerFirstname: dto.customerFirstname,
      customerLastname: dto.customerLastname,
      customerEmail: dto.customerEmail,
      transactionId,
      metadata: { userId: user.id },
    });

    await this.prisma.payment.update({
      where: { transactionId },
      data: { providerReference: result.token },
    });

    return {
      transactionId,
      paymentUrl: result.paymentUrl,
      token: result.token,
      message: 'Redirigez l\'utilisateur vers paymentUrl',
    };
  }

  @Get('payments/mine')
  @RequirePermissions(Permissions.PAYMENT_READ)
  @ApiOperation({ summary: 'Mes paiements' })
  getUserPayments(@CurrentUser('id') userId: string) {
    return this.paymentService.getUserPayments(userId);
  }

  @Get('subscriptions/mine')
  @RequirePermissions(Permissions.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Mes abonnements' })
  getUserSubscriptions(@CurrentUser('id') userId: string) {
    return this.paymentService.getUserSubscriptions(userId);
  }

  @Post('subscriptions')
  @RequirePermissions(Permissions.SUBSCRIPTION_CREATE)
  @ApiOperation({ summary: 'Créer un abonnement' })
  createSubscription(@CurrentUser('id') userId: string, @Body('plan') plan: string) {
    return this.paymentService.createSubscription(userId, plan);
  }

  @Get('admin/payments')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.PAYMENT_READ)
  @ApiOperation({ summary: 'Tous les paiements (admin)' })
  getAllPayments(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.paymentService.getAllPayments(+page, +limit);
  }

  @Post('admin/payments/:transactionId/refund')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.PAYMENT_REFUND)
  @ApiOperation({ summary: 'Rembourser un paiement (admin)' })
  refundPayment(@Param('transactionId') transactionId: string) {
    return this.paymentService.refundPayment(transactionId);
  }
}
