"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LigdiCashController", {
    enumerable: true,
    get: function() {
        return LigdiCashController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _ligdicashservice = require("./ligdicash.service");
const _prismaservice = require("../../../prisma/prisma.service");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let LigdiCashController = class LigdiCashController {
    async handleCallback(body, contentType) {
        const data = this.normalizeCallbackData(body, contentType);
        const transactionId = data.custom_data?.transaction_id;
        if (!transactionId) {
            return {
                message: 'transaction_id manquant'
            };
        }
        const dedupKey = `${transactionId}-${data.token}`;
        if (this.processedCallbacks.has(dedupKey)) {
            return {
                message: 'Callback déjà traité'
            };
        }
        this.processedCallbacks.add(dedupKey);
        setTimeout(()=>this.processedCallbacks.delete(dedupKey), 300000);
        const payment = await this.prisma.payment.findUnique({
            where: {
                transactionId
            }
        });
        if (!payment) {
            return {
                message: 'Transaction inconnue'
            };
        }
        if (payment.status === _client.PaymentStatus.SUCCESS || payment.status === _client.PaymentStatus.FAILED) {
            return {
                message: 'Paiement déjà finalisé'
            };
        }
        if (payment.status !== _client.PaymentStatus.PENDING) {
            await this.prisma.payment.update({
                where: {
                    transactionId
                },
                data: {
                    status: _client.PaymentStatus.PENDING
                }
            });
        }
        const storedToken = payment.providerReference;
        if (!storedToken) {
            return {
                message: 'Token de création introuvable'
            };
        }
        const confirmResult = await this.ligdicashService.confirmPayin(storedToken);
        if (confirmResult.status === 'completed') {
            await this.prisma.payment.update({
                where: {
                    transactionId
                },
                data: {
                    status: _client.PaymentStatus.SUCCESS,
                    paidAt: new Date()
                }
            });
        } else if (confirmResult.status === 'notcompleted') {
            await this.prisma.payment.update({
                where: {
                    transactionId
                },
                data: {
                    status: _client.PaymentStatus.FAILED
                }
            });
        }
        return {
            message: 'Callback traité avec succès',
            status: confirmResult.status
        };
    }
    async confirmPayment(token) {
        if (!token) {
            return {
                success: false,
                message: 'Token requis'
            };
        }
        return this.ligdicashService.verifyAndConfirmPayin(token);
    }
    normalizeCallbackData(body, contentType) {
        if (typeof body === 'string') {
            try {
                return JSON.parse(body);
            } catch  {
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
        const jsonFields = [
            'response_code',
            'token',
            'status',
            'custom_data'
        ];
        for (const key of Object.keys(body)){
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
                custom_data: typeof body.custom_data === 'string' ? JSON.parse(body.custom_data) : body.custom_data
            };
        }
        return body;
    }
    constructor(ligdicashService, prisma){
        this.ligdicashService = ligdicashService;
        this.prisma = prisma;
        this.processedCallbacks = new Set();
    }
};
_ts_decorate([
    (0, _common.Post)('callback'),
    (0, _common.HttpCode)(200),
    (0, _swagger.ApiExcludeEndpoint)(),
    (0, _swagger.ApiOperation)({
        summary: 'Callback LigdiCash (JSON + URL-encoded support)'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Headers)('content-type')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LigdiCashController.prototype, "handleCallback", null);
_ts_decorate([
    (0, _common.Get)('confirm'),
    (0, _swagger.ApiExcludeEndpoint)(),
    (0, _swagger.ApiOperation)({
        summary: 'Vérifier le statut d\'un paiement LigdiCash'
    }),
    _ts_param(0, (0, _common.Query)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LigdiCashController.prototype, "confirmPayment", null);
LigdiCashController = _ts_decorate([
    (0, _swagger.ApiTags)('Payment'),
    (0, _common.Controller)('payments/ligdicash'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _ligdicashservice.LigdiCashService === "undefined" ? Object : _ligdicashservice.LigdiCashService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], LigdiCashController);

//# sourceMappingURL=ligdicash.controller.js.map