"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bController", {
    enumerable: true,
    get: function() {
        return B2bController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _b2bservice = require("./b2b.service");
const _createorganizationdto = require("./dto/create-organization.dto");
const _createlicensedto = require("./dto/create-license.dto");
const _createlearningpathdto = require("./dto/create-learningpath.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
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
let B2bController = class B2bController {
    createOrganization(dto) {
        return this.b2bService.createOrganization(dto);
    }
    findAllOrganizations() {
        return this.b2bService.findAllOrganizations();
    }
    findOneOrganization(id) {
        return this.b2bService.findOneOrganization(id);
    }
    createLicense(dto) {
        return this.b2bService.createLicense(dto);
    }
    assignLicense(licenseId, userId, assignedBy) {
        return this.b2bService.assignLicense(licenseId, userId, assignedBy);
    }
    revokeLicense(assignmentId) {
        return this.b2bService.revokeLicense(assignmentId);
    }
    getOrganizationLicenses(orgId) {
        return this.b2bService.getOrganizationLicenses(orgId);
    }
    createLearningPath(dto) {
        return this.b2bService.createLearningPath(dto);
    }
    getOrganizationLearningPaths(orgId) {
        return this.b2bService.getOrganizationLearningPaths(orgId);
    }
    constructor(b2bService){
        this.b2bService = b2bService;
    }
};
_ts_decorate([
    (0, _common.Post)('organizations'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ORGANIZATION_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer une organisation'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createorganizationdto.CreateOrganizationDto === "undefined" ? Object : _createorganizationdto.CreateOrganizationDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "createOrganization", null);
_ts_decorate([
    (0, _common.Get)('organizations'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ORGANIZATION_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Liste des organisations'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "findAllOrganizations", null);
_ts_decorate([
    (0, _common.Get)('organizations/:id'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ORGANIZATION_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Détail d\'une organisation'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "findOneOrganization", null);
_ts_decorate([
    (0, _common.Post)('licenses'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LICENSE_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer une licence'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createlicensedto.CreateLicenseDto === "undefined" ? Object : _createlicensedto.CreateLicenseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "createLicense", null);
_ts_decorate([
    (0, _common.Post)('licenses/:licenseId/assign/:userId'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LICENSE_ASSIGN),
    (0, _swagger.ApiOperation)({
        summary: 'Assigner une licence à un utilisateur'
    }),
    _ts_param(0, (0, _common.Param)('licenseId')),
    _ts_param(1, (0, _common.Param)('userId')),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "assignLicense", null);
_ts_decorate([
    (0, _common.Post)('licenses/revoke/:assignmentId'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LICENSE_REVOKE),
    (0, _swagger.ApiOperation)({
        summary: 'Révoquer une assignation de licence'
    }),
    _ts_param(0, (0, _common.Param)('assignmentId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "revokeLicense", null);
_ts_decorate([
    (0, _common.Get)('organizations/:orgId/licenses'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LICENSE_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Licences d\'une organisation'
    }),
    _ts_param(0, (0, _common.Param)('orgId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "getOrganizationLicenses", null);
_ts_decorate([
    (0, _common.Post)('learning-paths'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LEARNINGPATH_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un parcours d\'apprentissage'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createlearningpathdto.CreateLearningPathDto === "undefined" ? Object : _createlearningpathdto.CreateLearningPathDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "createLearningPath", null);
_ts_decorate([
    (0, _common.Get)('organizations/:orgId/learning-paths'),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN, _roleenum.Role.ADMIN_INSTITUTION),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.LEARNINGPATH_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Parcours d\'apprentissage d\'une organisation'
    }),
    _ts_param(0, (0, _common.Param)('orgId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bController.prototype, "getOrganizationLearningPaths", null);
B2bController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B'),
    (0, _common.Controller)('b2b'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bservice.B2bService === "undefined" ? Object : _b2bservice.B2bService
    ])
], B2bController);

//# sourceMappingURL=b2b.controller.js.map