"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LigdiCashService", {
    enumerable: true,
    get: function() {
        return LigdiCashService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LigdiCashService = class LigdiCashService {
    getHeaders() {
        return {
            Apikey: this.apiKey,
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
    }
    async createPayin(params) {
        const payload = {
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
                    otp: ''
                },
                store: {
                    name: this.storeName,
                    website_url: this.storeWebsite
                },
                actions: {
                    cancel_url: this.cancelUrl,
                    return_url: this.returnUrl,
                    callback_url: this.callbackUrl
                },
                custom_data: {
                    transaction_id: params.transactionId,
                    ...params.metadata
                }
            }
        };
        const response = await fetch(`${this.baseUrl}/redirect/checkout-invoice/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.response_code !== '00') {
            throw new _common.HttpException(`LigdiCash error: ${data.response_text}`, _common.HttpStatus.BAD_REQUEST);
        }
        return {
            paymentUrl: data.response_text,
            token: data.token
        };
    }
    async confirmPayin(token) {
        const response = await fetch(`${this.baseUrl}/redirect/checkout-invoice/confirm?token=${token}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return response.json();
    }
    async verifyAndConfirmPayin(token, maxAttempts = 15, intervalMs = 4000) {
        for(let i = 0; i < maxAttempts; i++){
            const data = await this.confirmPayin(token);
            if (data.status === 'completed') {
                return {
                    success: true,
                    data
                };
            }
            if (data.status === 'notcompleted') {
                return {
                    success: false,
                    data,
                    reason: 'Paiement non complété'
                };
            }
            await new Promise((resolve)=>setTimeout(resolve, intervalMs));
        }
        return {
            success: false,
            reason: 'Timeout - délai de confirmation dépassé'
        };
    }
    constructor(configService){
        this.configService = configService;
        this.apiKey = this.configService.get('LIGDICASH_API_KEY');
        this.apiToken = this.configService.get('LIGDICASH_API_TOKEN');
        this.storeName = this.configService.get('LIGDICASH_STORE_NAME', 'Total Innovation Learning');
        this.storeWebsite = this.configService.get('LIGDICASH_STORE_WEBSITE', 'https://tilearning.net');
        this.returnUrl = this.configService.get('LIGDICASH_RETURN_URL', 'https://tilearning.net/payment/success');
        this.cancelUrl = this.configService.get('LIGDICASH_CANCEL_URL', 'https://tilearning.net/payment/cancel');
        this.callbackUrl = this.configService.get('LIGDICASH_CALLBACK_URL', 'https://api.tilearning.net/api/v1/payments/ligdicash/callback');
        const env = this.configService.get('NODE_ENV', 'development');
        this.baseUrl = env === 'production' ? 'https://app.ligdicash.com/pay/v01' : 'https://app.ligdicash.com/pay/v01';
    }
};
LigdiCashService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], LigdiCashService);

//# sourceMappingURL=ligdicash.service.js.map