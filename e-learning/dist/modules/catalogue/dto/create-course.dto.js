"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCourseDto", {
    enumerable: true,
    get: function() {
        return CreateCourseDto;
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
let CreateCourseDto = class CreateCourseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Introduction au Cloud AWS'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "thumbnail", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'domain_id'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "domainId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.CourseLevel,
        default: 'BEGINNER'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.CourseLevel),
    _ts_metadata("design:type", typeof _client.CourseLevel === "undefined" ? Object : _client.CourseLevel)
], CreateCourseDto.prototype, "level", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateCourseDto.prototype, "duration", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 'fr'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "language", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateCourseDto.prototype, "price", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: false
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateCourseDto.prototype, "isPublished", void 0);

//# sourceMappingURL=create-course.dto.js.map