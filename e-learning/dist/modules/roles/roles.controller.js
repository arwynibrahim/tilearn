"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RolesController", {
    enumerable: true,
    get: function() {
        return RolesController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _rolesservice = require("./roles.service");
const _permissions = require("./permissions");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _permissionsdecorator = require("../../common/decorators/permissions.decorator");
const _client = require("@prisma/client");
const _rolesdecorator = require("../../common/decorators/roles.decorator");
const _rolesguard = require("../../common/guards/roles.guard");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
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
let RolesController = class RolesController {
    getAllPermissions() {
        return this.rolesService.getAllPermissions();
    }
    syncPermissions() {
        return this.rolesService.syncPermissionsToDb();
    }
    getUserPermissions(userId) {
        return this.rolesService.getUserWithPermissions(userId);
    }
    getMyPermissions(userId) {
        return this.rolesService.getUserPermissions(userId);
    }
    constructor(rolesService){
        this.rolesService = rolesService;
    }
};
_ts_decorate([
    (0, _common.Get)('permissions'),
    (0, _rolesdecorator.Roles)(_client.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ROLE_MANAGE),
    (0, _swagger.ApiOperation)({
        summary: 'Toutes les permissions (groupées)'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "getAllPermissions", null);
_ts_decorate([
    (0, _common.Post)('sync'),
    (0, _rolesdecorator.Roles)(_client.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ROLE_MANAGE),
    (0, _swagger.ApiOperation)({
        summary: 'Synchroniser les permissions en base'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "syncPermissions", null);
_ts_decorate([
    (0, _common.Get)('user/:userId'),
    (0, _rolesdecorator.Roles)(_client.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ROLE_MANAGE),
    (0, _swagger.ApiOperation)({
        summary: 'Permissions d\'un utilisateur'
    }),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "getUserPermissions", null);
_ts_decorate([
    (0, _common.Get)('me'),
    (0, _swagger.ApiOperation)({
        summary: 'Mes permissions'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "getMyPermissions", null);
RolesController = _ts_decorate([
    (0, _swagger.ApiTags)('Roles'),
    (0, _common.Controller)('roles'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _rolesservice.RolesService === "undefined" ? Object : _rolesservice.RolesService
    ])
], RolesController);

//# sourceMappingURL=roles.controller.js.map