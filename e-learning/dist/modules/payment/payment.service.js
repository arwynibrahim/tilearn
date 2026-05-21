"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentService", {
    enumerable: true,
    get: function() {
        return PaymentService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PaymentService = class PaymentService {
    async createPayment(dto, userId) {
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
                userId
            }
        });
    }
    async getUserPayments(userId) {
        return this.prisma.payment.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getUserSubscriptions(userId) {
        return this.prisma.subscription.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async createSubscription(userId, plan) {
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);
        return this.prisma.subscription.create({
            data: {
                userId,
                plan: plan,
                currentPeriodStart: now,
                currentPeriodEnd: end
            }
        });
    }
    async getAllPayments(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            nom: true,
                            prenom: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.payment.count()
        ]);
        return {
            payments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
PaymentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PaymentService);

//# sourceMappingURL=payment.service.js.map