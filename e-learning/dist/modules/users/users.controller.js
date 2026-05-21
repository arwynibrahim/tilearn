"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersController", {
    enumerable: true,
    get: function() {
        return UsersController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _usersservice = require("./users.service");
const _updateuserdto = require("./dto/update-user.dto");
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
let UsersController = class UsersController {
    findAll(page = 1, limit = 20) {
        return this.usersService.findAll(+page, +limit);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, dto) {
        return this.usersService.update(id, dto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    constructor(usersService){
        this.usersService = usersService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.USER_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Liste des utilisateurs (admin)'
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Détail d\'un utilisateur'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.USER_UPDATE),
    (0, _swagger.ApiOperation)({
        summary: 'Modifier un utilisateur'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateuserdto.UpdateUserDto === "undefined" ? Object : _updateuserdto.UpdateUserDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.USER_DELETE),
    (0, _swagger.ApiOperation)({
        summary: 'Supprimer un utilisateur (soft delete)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
UsersController = _ts_decorate([
    (0, _swagger.ApiTags)('Users'),
    (0, _common.Controller)('users'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], UsersController);

//# sourceMappingURL=users.controller.js.map