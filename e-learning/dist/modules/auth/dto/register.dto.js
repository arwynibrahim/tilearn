"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RegisterDto", {
    enumerable: true,
    get: function() {
        return RegisterDto;
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
let RegisterDto = class RegisterDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'jean.dupont@email.com'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Mot2passe!Securise'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(8),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Dupont'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "nom", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Jean'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "prenom", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '+22670123456'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "telephone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.Role,
        default: 'LEARNER'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.Role),
    _ts_metadata("design:type", typeof _client.Role === "undefined" ? Object : _client.Role)
], RegisterDto.prototype, "role", void 0);

//# sourceMappingURL=register.dto.js.map