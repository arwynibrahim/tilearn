"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateVRHeadsetDto", {
    enumerable: true,
    get: function() {
        return CreateVRHeadsetDto;
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
let CreateVRHeadsetDto = class CreateVRHeadsetDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRHeadsetDto.prototype, "organizationId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRHeadsetDto.prototype, "serialNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.VRHeadsetModel
    }),
    (0, _classvalidator.IsEnum)(_client.VRHeadsetModel),
    _ts_metadata("design:type", typeof _client.VRHeadsetModel === "undefined" ? Object : _client.VRHeadsetModel)
], CreateVRHeadsetDto.prototype, "model", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVRHeadsetDto.prototype, "firmwareVersion", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateVRHeadsetDto.prototype, "batteryLevel", void 0);

//# sourceMappingURL=create-vrheadset.dto.js.map