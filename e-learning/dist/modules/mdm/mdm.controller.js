"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MdmController", {
    enumerable: true,
    get: function() {
        return MdmController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _mdmservice = require("./mdm.service");
const _createvrheadsetdto = require("./dto/create-vrheadset.dto");
const _rolesdecorator = require("../../common/decorators/roles.decorator");
const _rolesguard = require("../../common/guards/roles.guard");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _permissionsdecorator = require("../../common/decorators/permissions.decorator");
const _permissions = require("../roles/permissions");
const _roleenum = require("../../common/enums/role.enum");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let MdmController = class MdmController {
    createHeadset(dto) {
        return this.mdmService.createHeadset(dto);
    }
    getOrganizationHeadsets(orgId) {
        return this.mdmService.getOrganizationHeadsets(orgId);
    }
    updateHeadsetStatus(id, status, batteryLevel) {
        return this.mdmService.updateHeadsetStatus(id, status, batteryLevel);
    }
    assignHeadset(id, userId) {
        return this.mdmService.assignHeadset(id, userId);
    }
    createChargingStation(data) {
        return this.mdmService.createChargingStation(data);
    }
    getOrganizationChargingStations(orgId) {
        return this.mdmService.getOrganizationChargingStations(orgId);
    }
    constructor(mdmService){
        this.mdmService = mdmService;
    }
};
_ts_decorate([
    (0, _common.Post)('headsets'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Ajouter un casque VR'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createvrheadsetdto.CreateVRHeadsetDto === "undefined" ? Object : _createvrheadsetdto.CreateVRHeadsetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "createHeadset", null);
_ts_decorate([
    (0, _common.Get)('organizations/:orgId/headsets'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Casques VR d\'une organisation'
    }),
    _ts_param(0, (0, _common.Param)('orgId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "getOrganizationHeadsets", null);
_ts_decorate([
    (0, _common.Patch)('headsets/:id/status'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_UPDATE),
    (0, _swagger.ApiOperation)({
        summary: 'Mettre à jour le statut d\'un casque'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('status')),
    _ts_param(2, (0, _common.Body)('batteryLevel')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "updateHeadsetStatus", null);
_ts_decorate([
    (0, _common.Post)('headsets/:id/assign/:userId'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_UPDATE),
    (0, _swagger.ApiOperation)({
        summary: 'Assigner un casque à un utilisateur'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "assignHeadset", null);
_ts_decorate([
    (0, _common.Post)('charging-stations'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_UPDATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer une station de charge'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "createChargingStation", null);
_ts_decorate([
    (0, _common.Get)('organizations/:orgId/charging-stations'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VRHEADSET_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Stations de charge d\'une organisation'
    }),
    _ts_param(0, (0, _common.Param)('orgId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], MdmController.prototype, "getOrganizationChargingStations", null);
MdmController = _ts_decorate([
    (0, _swagger.ApiTags)('MDM'),
    (0, _common.Controller)('mdm'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _mdmservice.MdmService === "undefined" ? Object : _mdmservice.MdmService
    ])
], MdmController);

//# sourceMappingURL=mdm.controller.js.map