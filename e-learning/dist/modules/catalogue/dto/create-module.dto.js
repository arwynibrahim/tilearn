"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateModuleDto", {
    enumerable: true,
    get: function() {
        return CreateModuleDto;
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
let CreateModuleDto = class CreateModuleDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'course_id'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateModuleDto.prototype, "courseId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Introduction à AWS EC2'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateModuleDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.ModuleType
    }),
    (0, _classvalidator.IsEnum)(_client.ModuleType),
    _ts_metadata("design:type", typeof _client.ModuleType === "undefined" ? Object : _client.ModuleType)
], CreateModuleDto.prototype, "type", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateModuleDto.prototype, "order", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateModuleDto.prototype, "contentUrl", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateModuleDto.prototype, "durationSeconds", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: true
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateModuleDto.prototype, "isRequired", void 0);

//# sourceMappingURL=create-module.dto.js.map