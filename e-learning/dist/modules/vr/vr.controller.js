"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VrController", {
    enumerable: true,
    get: function() {
        return VrController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _vrservice = require("./vr.service");
const _createvrscenedto = require("./dto/create-vrscene.dto");
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
let VrController = class VrController {
    createScene(dto) {
        return this.vrService.createScene(dto);
    }
    findSceneByModule(moduleId) {
        return this.vrService.findSceneByModule(moduleId);
    }
    findOneScene(id) {
        return this.vrService.findOneScene(id);
    }
    updateScene(id, dto) {
        return this.vrService.updateScene(id, dto);
    }
    constructor(vrService){
        this.vrService = vrService;
    }
};
_ts_decorate([
    (0, _common.Post)('scenes'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VR_SCENE_CREATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Créer une scène VR'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createvrscenedto.CreateVRSceneDto === "undefined" ? Object : _createvrscenedto.CreateVRSceneDto
    ]),
    _ts_metadata("design:returntype", void 0)
], VrController.prototype, "createScene", null);
_ts_decorate([
    (0, _common.Get)('modules/:moduleId/scene'),
    (0, _swagger.ApiOperation)({
        summary: 'Obtenir la scène VR d\'un module'
    }),
    _ts_param(0, (0, _common.Param)('moduleId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VrController.prototype, "findSceneByModule", null);
_ts_decorate([
    (0, _common.Get)('scenes/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Détail d\'une scène VR'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VrController.prototype, "findOneScene", null);
_ts_decorate([
    (0, _common.Patch)('scenes/:id'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.VR_SCENE_UPDATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Modifier une scène VR'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Partial === "undefined" ? Object : Partial
    ]),
    _ts_metadata("design:returntype", void 0)
], VrController.prototype, "updateScene", null);
VrController = _ts_decorate([
    (0, _swagger.ApiTags)('VR'),
    (0, _common.Controller)('vr'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _vrservice.VrService === "undefined" ? Object : _vrservice.VrService
    ])
], VrController);

//# sourceMappingURL=vr.controller.js.map