"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateLicenseDto", {
    enumerable: true,
    get: function() {
        return CreateLicenseDto;
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
let CreateLicenseDto = class CreateLicenseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateLicenseDto.prototype, "organizationId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.LicensePlan
    }),
    (0, _classvalidator.IsEnum)(_client.LicensePlan),
    _ts_metadata("design:type", typeof _client.LicensePlan === "undefined" ? Object : _client.LicensePlan)
], CreateLicenseDto.prototype, "plan", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateLicenseDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateLicenseDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateLicenseDto.prototype, "endDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateLicenseDto.prototype, "price", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: true
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateLicenseDto.prototype, "autoRenew", void 0);

//# sourceMappingURL=create-license.dto.js.map