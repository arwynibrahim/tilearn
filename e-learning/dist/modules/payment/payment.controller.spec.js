"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _paymentcontroller = require("./payment.controller");
const _paymentservice = require("./payment.service");
const _ligdicashservice = require("./ligdicash/ligdicash.service");
const _prismaservice = require("../../prisma/prisma.service");
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
jest.mock('crypto', ()=>({
        randomBytes: jest.fn()
    }));
const mockPaymentService = {
    createPayment: jest.fn(),
    getUserPayments: jest.fn(),
    getUserSubscriptions: jest.fn(),
    createSubscription: jest.fn(),
    getAllPayments: jest.fn()
};
const mockLigdicashService = {
    createPayin: jest.fn()
};
const mockPrisma = {
    payment: {
        update: jest.fn()
    }
};
describe('PaymentController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _paymentcontroller.PaymentController
            ],
            providers: [
                {
                    provide: _paymentservice.PaymentService,
                    useValue: mockPaymentService
                },
                {
                    provide: _ligdicashservice.LigdiCashService,
                    useValue: mockLigdicashService
                },
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        controller = module.get(_paymentcontroller.PaymentController);
        jest.clearAllMocks();
    });
    describe('createPayment', ()=>{
        it('should call paymentService.createPayment', async ()=>{
            const dto = {
                transactionId: 'T1',
                amount: 5000,
                provider: 'CINETPAY'
            };
            mockPaymentService.createPayment.mockResolvedValue({
                id: 'p1'
            });
            const result = await controller.createPayment(dto, 'user-1');
            expect(mockPaymentService.createPayment).toHaveBeenCalledWith(dto, 'user-1');
            expect(result).toEqual({
                id: 'p1'
            });
        });
    });
    describe('initiateLigdiCashPayin', ()=>{
        it('should initiate payin and return payment URL', async ()=>{
            const dto = {
                amount: 5000,
                customerPhone: '22670000000',
                customerFirstname: 'J',
                customerLastname: 'D',
                customerEmail: 'j@d.com'
            };
            const user = {
                id: 'u1',
                email: 'j@d.com',
                nom: 'D',
                prenom: 'J'
            };
            _crypto.randomBytes.mockReturnValue(Buffer.from([
                0xaa,
                0xbb,
                0xcc,
                0xdd
            ]));
            mockPaymentService.createPayment.mockResolvedValue({
                id: 'p1'
            });
            mockLigdicashService.createPayin.mockResolvedValue({
                paymentUrl: 'https://pay.url',
                token: 'tok-123'
            });
            mockPrisma.payment.update.mockResolvedValue({});
            const result = await controller.initiateLigdiCashPayin(dto, user);
            expect(mockPaymentService.createPayment).toHaveBeenCalled();
            expect(mockLigdicashService.createPayin).toHaveBeenCalledWith(expect.objectContaining({
                amount: 5000,
                currency: 'XOF',
                transactionId: expect.stringContaining('TIL-')
            }));
            expect(mockPrisma.payment.update).toHaveBeenCalledWith({
                where: {
                    transactionId: expect.stringContaining('TIL-')
                },
                data: {
                    providerReference: 'tok-123'
                }
            });
            expect(result).toEqual({
                transactionId: expect.stringContaining('TIL-'),
                paymentUrl: 'https://pay.url',
                token: 'tok-123',
                message: 'Redirigez l\'utilisateur vers paymentUrl'
            });
        });
    });
    describe('getUserPayments', ()=>{
        it('should call paymentService.getUserPayments', async ()=>{
            mockPaymentService.getUserPayments.mockResolvedValue([]);
            const result = await controller.getUserPayments('user-1');
            expect(mockPaymentService.getUserPayments).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([]);
        });
    });
    describe('getUserSubscriptions', ()=>{
        it('should call paymentService.getUserSubscriptions', async ()=>{
            mockPaymentService.getUserSubscriptions.mockResolvedValue([]);
            const result = await controller.getUserSubscriptions('user-1');
            expect(mockPaymentService.getUserSubscriptions).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([]);
        });
    });
    describe('createSubscription', ()=>{
        it('should call paymentService.createSubscription', async ()=>{
            mockPaymentService.createSubscription.mockResolvedValue({
                id: 's1'
            });
            const result = await controller.createSubscription('user-1', 'PRO');
            expect(mockPaymentService.createSubscription).toHaveBeenCalledWith('user-1', 'PRO');
            expect(result).toEqual({
                id: 's1'
            });
        });
    });
    describe('getAllPayments', ()=>{
        it('should call paymentService.getAllPayments', async ()=>{
            mockPaymentService.getAllPayments.mockResolvedValue({
                payments: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0
            });
            const result = await controller.getAllPayments(1, 20);
            expect(mockPaymentService.getAllPayments).toHaveBeenCalledWith(1, 20);
            expect(result).toEqual({
                payments: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0
            });
        });
    });
});

//# sourceMappingURL=payment.controller.spec.js.map