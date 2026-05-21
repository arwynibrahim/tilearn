"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InitiatePayinDto", {
    enumerable: true,
    get: function() {
        return InitiatePayinDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let InitiatePayinDto = class InitiatePayinDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Montant en FCFA',
        example: 50000
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(9),
    _ts_metadata("design:type", Number)
], InitiatePayinDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Téléphone du client (ex: 226XXXXXXXX)',
        example: '22670000000'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "customerPhone", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Jean'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "customerFirstname", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Dupont'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "customerLastname", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'jean@email.com'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "customerEmail", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Abonnement Pro - Mensuel'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 'XOF'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitiatePayinDto.prototype, "currency", void 0);

//# sourceMappingURL=initiate-payin.dto.js.map