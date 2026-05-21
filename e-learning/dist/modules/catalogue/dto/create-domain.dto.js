"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateDomainDto", {
    enumerable: true,
    get: function() {
        return CreateDomainDto;
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
let CreateDomainDto = class CreateDomainDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Développement Informatique'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDomainDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'developpement-informatique'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDomainDto.prototype, "slug", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDomainDto.prototype, "icon", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDomainDto.prototype, "description", void 0);

//# sourceMappingURL=create-domain.dto.js.map