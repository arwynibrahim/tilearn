"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InstructorController", {
    enumerable: true,
    get: function() {
        return InstructorController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _instructorservice = require("./instructor.service");
const _createreviewdto = require("./dto/create-review.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _rolesguard = require("../../common/guards/roles.guard");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _permissionsdecorator = require("../../common/decorators/permissions.decorator");
const _permissions = require("../roles/permissions");
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
let InstructorController = class InstructorController {
    getProfile(userId) {
        return this.instructorService.getProfile(userId);
    }
    updateProfile(userId, data) {
        return this.instructorService.updateProfile(userId, data);
    }
    getInstructorCourses(userId) {
        return this.instructorService.getInstructorCourses(userId);
    }
    getInstructorStats(userId) {
        return this.instructorService.getInstructorStats(userId);
    }
    // ─── Avis publics ───────────────────────────────────────────
    createReview(dto, userId) {
        return this.instructorService.createReview(dto, userId);
    }
    getCourseReviews(courseId) {
        return this.instructorService.getCourseReviews(courseId);
    }
    constructor(instructorService){
        this.instructorService = instructorService;
    }
};
_ts_decorate([
    (0, _common.Get)('instructor/profile'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.INSTRUCTOR_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mon profil instructeur'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "getProfile", null);
_ts_decorate([
    (0, _common.Patch)('instructor/profile'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.INSTRUCTOR_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mettre à jour mon profil instructeur'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "updateProfile", null);
_ts_decorate([
    (0, _common.Get)('instructor/courses'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.INSTRUCTOR_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes cours en tant qu\'instructeur'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "getInstructorCourses", null);
_ts_decorate([
    (0, _common.Get)('instructor/stats'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.INSTRUCTOR_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes statistiques instructeur'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "getInstructorStats", null);
_ts_decorate([
    (0, _common.Post)('reviews'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.REVIEW_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Ajouter un avis sur un cours'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createreviewdto.CreateReviewDto === "undefined" ? Object : _createreviewdto.CreateReviewDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "createReview", null);
_ts_decorate([
    (0, _common.Get)('courses/:courseId/reviews'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.REVIEW_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Avis d\'un cours'
    }),
    _ts_param(0, (0, _common.Param)('courseId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InstructorController.prototype, "getCourseReviews", null);
InstructorController = _ts_decorate([
    (0, _swagger.ApiTags)('Instructor'),
    (0, _common.Controller)(),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _instructorservice.InstructorService === "undefined" ? Object : _instructorservice.InstructorService
    ])
], InstructorController);

//# sourceMappingURL=instructor.controller.js.map