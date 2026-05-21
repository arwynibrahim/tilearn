"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateReviewDto", {
    enumerable: true,
    get: function() {
        return CreateReviewDto;
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
let CreateReviewDto = class CreateReviewDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateReviewDto.prototype, "courseId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        minimum: 1,
        maximum: 5
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(5),
    _ts_metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);

//# sourceMappingURL=create-review.dto.js.map