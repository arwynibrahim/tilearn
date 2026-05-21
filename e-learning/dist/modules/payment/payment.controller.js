"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentController", {
    enumerable: true,
    get: function() {
        return PaymentController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _paymentservice = require("./payment.service");
const _ligdicashservice = require("./ligdicash/ligdicash.service");
const _prismaservice = require("../../prisma/prisma.service");
const _createpaymentdto = require("./dto/create-payment.dto");
const _initiatepayindto = require("./dto/initiate-payin.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _rolesdecorator = require("../../common/decorators/roles.decorator");
const _rolesguard = require("../../common/guards/roles.guard");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _permissionsdecorator = require("../../common/decorators/permissions.decorator");
const _permissions = require("../roles/permissions");
const _roleenum = require("../../common/enums/role.enum");
const _client = require("@prisma/client");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
let PaymentController = class PaymentController {
    createPayment(dto, userId) {
        return this.paymentService.createPayment(dto, userId);
    }
    async initiateLigdiCashPayin(dto, user) {
        const transactionId = `TIL-${Date.now()}-${_crypto.randomBytes(4).toString('hex')}`;
        const description = dto.description || 'Paiement Total Innovation Learning';
        await this.paymentService.createPayment({
            transactionId,
            amount: dto.amount,
            currency: dto.currency || 'XOF',
            provider: _client.PaymentProvider.CINETPAY,
            status: _client.PaymentStatus.PENDING
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
            metadata: {
                userId: user.id
            }
        });
        await this.prisma.payment.update({
            where: {
                transactionId
            },
            data: {
                providerReference: result.token
            }
        });
        return {
            transactionId,
            paymentUrl: result.paymentUrl,
            token: result.token,
            message: 'Redirigez l\'utilisateur vers paymentUrl'
        };
    }
    getUserPayments(userId) {
        return this.paymentService.getUserPayments(userId);
    }
    getUserSubscriptions(userId) {
        return this.paymentService.getUserSubscriptions(userId);
    }
    createSubscription(userId, plan) {
        return this.paymentService.createSubscription(userId, plan);
    }
    getAllPayments(page = 1, limit = 20) {
        return this.paymentService.getAllPayments(+page, +limit);
    }
    constructor(paymentService, ligdicashService, prisma){
        this.paymentService = paymentService;
        this.ligdicashService = ligdicashService;
        this.prisma = prisma;
    }
};
_ts_decorate([
    (0, _common.Post)('payments'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PAYMENT_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un paiement'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpaymentdto.CreatePaymentDto === "undefined" ? Object : _createpaymentdto.CreatePaymentDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentController.prototype, "createPayment", null);
_ts_decorate([
    (0, _common.Post)('payments/ligdicash/initiate'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PAYMENT_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Initier un paiement LigdiCash avec redirection'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _initiatepayindto.InitiatePayinDto === "undefined" ? Object : _initiatepayindto.InitiatePayinDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "initiateLigdiCashPayin", null);
_ts_decorate([
    (0, _common.Get)('payments/mine'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PAYMENT_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes paiements'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentController.prototype, "getUserPayments", null);
_ts_decorate([
    (0, _common.Get)('subscriptions/mine'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.SUBSCRIPTION_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes abonnements'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentController.prototype, "getUserSubscriptions", null);
_ts_decorate([
    (0, _common.Post)('subscriptions'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.SUBSCRIPTION_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un abonnement'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Body)('plan')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentController.prototype, "createSubscription", null);
_ts_decorate([
    (0, _common.Get)('admin/payments'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PAYMENT_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Tous les paiements (admin)'
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentController.prototype, "getAllPayments", null);
PaymentController = _ts_decorate([
    (0, _swagger.ApiTags)('Payment'),
    (0, _common.Controller)(),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentservice.PaymentService === "undefined" ? Object : _paymentservice.PaymentService,
        typeof _ligdicashservice.LigdiCashService === "undefined" ? Object : _ligdicashservice.LigdiCashService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PaymentController);

//# sourceMappingURL=payment.controller.js.map