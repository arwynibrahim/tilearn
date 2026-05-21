import { Controller, Post, Get, Body, Query, HttpCode, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { LigdiCashService } from './ligdicash.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@ApiTags('Payment')
@Controller('payments/ligdicash')
export class LigdiCashController {
  private processedCallbacks = new Set<string>();

  constructor(
    private readonly ligdicashService: LigdiCashService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('callback')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Callback LigdiCash (JSON + URL-encoded support)' })
  async handleCallback(
    @Body() body: any,
    @Headers('content-type') contentType: string,
  ) {
    const data = this.normalizeCallbackData(body, contentType);
    const transactionId = data.custom_data?.transaction_id;

    if (!transactionId) {
      return { message: 'transaction_id manquant' };
    }

    const dedupKey = `${transactionId}-${data.token}`;
    if (this.processedCallbacks.has(dedupKey)) {
      return { message: 'Callback déjà traité' };
    }
    this.processedCallbacks.add(dedupKey);
    setTimeout(() => this.processedCallbacks.delete(dedupKey), 300000);

    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
    });
    if (!payment) {
      return { message: 'Transaction inconnue' };
    }

    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return { message: 'Paiement déjà finalisé' };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      await this.prisma.payment.update({
        where: { transactionId },
        data: { status: PaymentStatus.PENDING },
      });
    }

    const storedToken = payment.providerReference;

    if (!storedToken) {
      return { message: 'Token de création introuvable' };
    }

    const confirmResult = await this.ligdicashService.confirmPayin(storedToken);

    if (confirmResult.status === 'completed') {
      await this.prisma.payment.update({
        where: { transactionId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });
    } else if (confirmResult.status === 'notcompleted') {
      await this.prisma.payment.update({
        where: { transactionId },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { message: 'Callback traité avec succès', status: confirmResult.status };
  }

  @Get('confirm')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Vérifier le statut d\'un paiement LigdiCash' })
  async confirmPayment(@Query('token') token: string): Promise<any> {
    if (!token) {
      return { success: false, message: 'Token requis' };
    }

    return this.ligdicashService.verifyAndConfirmPayin(token);
  }

  private normalizeCallbackData(body: any, contentType: string): any {
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }

    if (body?.response_code || body?.token) {
      return body;
    }

    if (body?.commande) {
      return body;
    }

    if (body?.custom_data) {
      return body;
    }

    const jsonFields = ['response_code', 'token', 'status', 'custom_data'];
    for (const key of Object.keys(body)) {
      if (jsonFields.includes(key)) {
        return body;
      }
    }

    if (body?.command || body?.invoice) {
      return {
        response_code: body.response_code || body.code,
        token: body.token,
        response_text: body.response_text || body.message,
        status: body.status,
        custom_data: typeof body.custom_data === 'string'
          ? JSON.parse(body.custom_data)
          : body.custom_data,
      };
    }

    return body;
  }
}
