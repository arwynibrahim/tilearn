import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LigdiCashInvoice {
  total_amount: number;
  devise: string;
  description: string;
  customer: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  external_id: string;
  otp: string;
}

interface LigdiCashStore {
  name: string;
  website_url: string;
}

interface LigdiCashActions {
  cancel_url: string;
  return_url: string;
  callback_url: string;
}

interface LigdiCashCustomData {
  transaction_id: string;
  user_id?: string;
  [key: string]: any;
}

interface LigdiCashRequest {
  commande: {
    invoice: LigdiCashInvoice;
    store: LigdiCashStore;
    actions: LigdiCashActions;
    custom_data: LigdiCashCustomData;
  };
}

interface LigdiCashResponse {
  response_code: string;
  token: string;
  response_text: string;
  description: string;
  custom_data?: LigdiCashCustomData;
  wiki?: string;
}

interface LigdiCashConfirmResponse {
  response_code: string;
  token: string;
  response_text: string;
  status: 'completed' | 'pending' | 'notcompleted';
  transaction_id?: string;
  operator_id?: string;
  operator_name?: string;
  customer?: string;
  amount?: number;
  devise?: string;
  custom_data?: LigdiCashCustomData;
  description?: string;
}

@Injectable()
export class LigdiCashService {
  private readonly apiKey: string;
  private readonly apiToken: string;
  private readonly baseUrl: string;
  private readonly storeName: string;
  private readonly storeWebsite: string;
  private readonly returnUrl: string;
  private readonly cancelUrl: string;
  private readonly callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIGDICASH_API_KEY')!;
    this.apiToken = this.configService.get<string>('LIGDICASH_API_TOKEN')!;
    this.storeName = this.configService.get<string>('LIGDICASH_STORE_NAME', 'Total Innovation Learning')!;
    this.storeWebsite = this.configService.get<string>('LIGDICASH_STORE_WEBSITE', 'https://tilearning.net')!;
    this.returnUrl = this.configService.get<string>('LIGDICASH_RETURN_URL', 'https://tilearning.net/payment/success')!;
    this.cancelUrl = this.configService.get<string>('LIGDICASH_CANCEL_URL', 'https://tilearning.net/payment/cancel')!;
    this.callbackUrl = this.configService.get<string>('LIGDICASH_CALLBACK_URL', 'https://api.tilearning.net/api/v1/payments/ligdicash/callback')!;

    const env = this.configService.get<string>('NODE_ENV', 'development');
    this.baseUrl = env === 'production'
      ? 'https://app.ligdicash.com/pay/v01'
      : 'https://app.ligdicash.com/pay/v01';
  }

  private getHeaders(): Record<string, string> {
    return {
      Apikey: this.apiKey,
      Authorization: `Bearer ${this.apiToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async createPayin(params: {
    amount: number;
    currency?: string;
    description: string;
    customerPhone: string;
    customerFirstname: string;
    customerLastname: string;
    customerEmail: string;
    transactionId: string;
    metadata?: Record<string, any>;
  }): Promise<{ paymentUrl: string; token: string }> {
    const payload: LigdiCashRequest = {
      commande: {
        invoice: {
          total_amount: Math.round(params.amount),
          devise: params.currency || 'XOF',
          description: params.description,
          customer: params.customerPhone,
          customer_firstname: params.customerFirstname,
          customer_lastname: params.customerLastname,
          customer_email: params.customerEmail,
          external_id: '',
          otp: '',
        },
        store: {
          name: this.storeName,
          website_url: this.storeWebsite,
        },
        actions: {
          cancel_url: this.cancelUrl,
          return_url: this.returnUrl,
          callback_url: this.callbackUrl,
        },
        custom_data: {
          transaction_id: params.transactionId,
          ...params.metadata,
        },
      },
    };

    const response = await fetch(`${this.baseUrl}/redirect/checkout-invoice/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data: LigdiCashResponse = await response.json();

    if (data.response_code !== '00') {
      throw new HttpException(
        `LigdiCash error: ${data.response_text}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      paymentUrl: data.response_text,
      token: data.token,
    };
  }

  async confirmPayin(token: string): Promise<LigdiCashConfirmResponse> {
    const response = await fetch(
      `${this.baseUrl}/redirect/checkout-invoice/confirm?token=${token}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
    );

    return response.json();
  }

  async verifyAndConfirmPayin(token: string, maxAttempts = 15, intervalMs = 4000): Promise<{ success: boolean; data?: LigdiCashConfirmResponse; reason?: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      const data = await this.confirmPayin(token);

      if (data.status === 'completed') {
        return { success: true, data };
      }
      if (data.status === 'notcompleted') {
        return { success: false, data, reason: 'Paiement non complété' };
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { success: false, reason: 'Timeout - délai de confirmation dépassé' };
  }
}
