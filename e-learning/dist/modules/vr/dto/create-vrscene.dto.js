"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateVRSceneDto", {
    enumerable: true,
    get: function() {
        return CreateVRSceneDto;
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
let CreateVRSceneDto = class CreateVRSceneDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRSceneDto.prototype, "moduleId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Labo Cloud AWS Virtual'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRSceneDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], CreateVRSceneDto.prototype, "sceneData", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], CreateVRSceneDto.prototype, "interactions", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], CreateVRSceneDto.prototype, "branches", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRSceneDto.prototype, "fallback360Url", void 0);

//# sourceMappingURL=create-vrscene.dto.js.map