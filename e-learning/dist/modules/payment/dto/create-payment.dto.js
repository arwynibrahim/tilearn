"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreatePaymentDto", {
    enumerable: true,
    get: function() {
        return CreatePaymentDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
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
let CreatePaymentDto = class CreatePaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "transactionId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 'XOF'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.PaymentProvider
    }),
    (0, _classvalidator.IsEnum)(_client.PaymentProvider),
    _ts_metadata("design:type", typeof _client.PaymentProvider === "undefined" ? Object : _client.PaymentProvider)
], CreatePaymentDto.prototype, "provider", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.PaymentStatus
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.PaymentStatus),
    _ts_metadata("design:type", typeof _client.PaymentStatus === "undefined" ? Object : _client.PaymentStatus)
], CreatePaymentDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.PaymentMethod
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.PaymentMethod),
    _ts_metadata("design:type", typeof _client.PaymentMethod === "undefined" ? Object : _client.PaymentMethod)
], CreatePaymentDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "subscriptionId", void 0);

//# sourceMappingURL=create-payment.dto.js.map