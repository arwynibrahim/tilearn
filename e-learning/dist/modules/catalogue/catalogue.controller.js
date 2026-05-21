"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CatalogueController", {
    enumerable: true,
    get: function() {
        return CatalogueController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _catalogueservice = require("./catalogue.service");
const _createcoursedto = require("./dto/create-course.dto");
const _updatecoursedto = require("./dto/update-course.dto");
const _createdomaindto = require("./dto/create-domain.dto");
const _createmoduledto = require("./dto/create-module.dto");
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
let CatalogueController = class CatalogueController {
    // ─── Domaines ─────────────────────────────────────────────
    createDomain(dto) {
        return this.catalogueService.createDomain(dto);
    }
    findAllDomains() {
        return this.catalogueService.findAllDomains();
    }
    findOneDomain(id) {
        return this.catalogueService.findOneDomain(id);
    }
    // ─── Cours ─────────────────────────────────────────────────
    createCourse(dto, userId) {
        return this.catalogueService.createCourse(dto, userId);
    }
    findAllCourses(page = 1, limit = 20, domainId, level) {
        return this.catalogueService.findAllCourses(+page, +limit, {
            domainId,
            level
        });
    }
    findOneCourse(slug) {
        return this.catalogueService.findOneCourse(slug);
    }
    updateCourse(id, dto) {
        return this.catalogueService.updateCourse(id, dto);
    }
    removeCourse(id) {
        return this.catalogueService.removeCourse(id);
    }
    // ─── Modules ───────────────────────────────────────────────
    createModule(dto) {
        return this.catalogueService.createModule(dto);
    }
    findModulesByCourse(courseId) {
        return this.catalogueService.findModulesByCourse(courseId);
    }
    updateModule(id, dto) {
        return this.catalogueService.updateModule(id, dto);
    }
    constructor(catalogueService){
        this.catalogueService = catalogueService;
    }
};
_ts_decorate([
    (0, _common.Post)('domains'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.DOMAIN_CREATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un domaine'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdomaindto.CreateDomainDto === "undefined" ? Object : _createdomaindto.CreateDomainDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "createDomain", null);
_ts_decorate([
    (0, _common.Get)('domains'),
    (0, _swagger.ApiOperation)({
        summary: 'Liste des domaines'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "findAllDomains", null);
_ts_decorate([
    (0, _common.Get)('domains/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Détail d\'un domaine avec ses cours'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "findOneDomain", null);
_ts_decorate([
    (0, _common.Post)('courses'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.COURSE_CREATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un cours'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcoursedto.CreateCourseDto === "undefined" ? Object : _createcoursedto.CreateCourseDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "createCourse", null);
_ts_decorate([
    (0, _common.Get)('courses'),
    (0, _swagger.ApiOperation)({
        summary: 'Liste des cours publiés'
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('domainId')),
    _ts_param(3, (0, _common.Query)('level')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "findAllCourses", null);
_ts_decorate([
    (0, _common.Get)('courses/:slug'),
    (0, _swagger.ApiOperation)({
        summary: 'Détail d\'un cours par slug'
    }),
    _ts_param(0, (0, _common.Param)('slug')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "findOneCourse", null);
_ts_decorate([
    (0, _common.Patch)('courses/:id'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.COURSE_UPDATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Modifier un cours'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecoursedto.UpdateCourseDto === "undefined" ? Object : _updatecoursedto.UpdateCourseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "updateCourse", null);
_ts_decorate([
    (0, _common.Delete)('courses/:id'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.COURSE_DELETE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Dépublier un cours'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "removeCourse", null);
_ts_decorate([
    (0, _common.Post)('modules'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.MODULE_CREATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Créer un module'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createmoduledto.CreateModuleDto === "undefined" ? Object : _createmoduledto.CreateModuleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "createModule", null);
_ts_decorate([
    (0, _common.Get)('courses/:courseId/modules'),
    (0, _swagger.ApiOperation)({
        summary: 'Modules d\'un cours'
    }),
    _ts_param(0, (0, _common.Param)('courseId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "findModulesByCourse", null);
_ts_decorate([
    (0, _common.Patch)('modules/:id'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _rolesdecorator.Roles)(_roleenum.Role.INSTRUCTOR, _roleenum.Role.SUPER_ADMIN),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.MODULE_UPDATE),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Modifier un module'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Partial === "undefined" ? Object : Partial
    ]),
    _ts_metadata("design:returntype", void 0)
], CatalogueController.prototype, "updateModule", null);
CatalogueController = _ts_decorate([
    (0, _swagger.ApiTags)('Catalogue'),
    (0, _common.Controller)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _catalogueservice.CatalogueService === "undefined" ? Object : _catalogueservice.CatalogueService
    ])
], CatalogueController);

//# sourceMappingURL=catalogue.controller.js.map