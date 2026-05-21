"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LearningController", {
    enumerable: true,
    get: function() {
        return LearningController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _learningservice = require("./learning.service");
const _createenrollmentdto = require("./dto/create-enrollment.dto");
const _submitquizdto = require("./dto/submit-quiz.dto");
const _updateprogressdto = require("./dto/update-progress.dto");
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
let LearningController = class LearningController {
    // ─── Inscriptions ─────────────────────────────────────────
    enroll(dto, userId) {
        return this.learningService.enroll(dto, userId);
    }
    getUserEnrollments(userId) {
        return this.learningService.getUserEnrollments(userId);
    }
    // ─── Progression ──────────────────────────────────────────
    updateProgress(userId, moduleId, dto) {
        return this.learningService.updateProgress(userId, moduleId, dto);
    }
    getUserProgress(userId, courseId) {
        return this.learningService.getUserProgress(userId, courseId);
    }
    // ─── Quiz ─────────────────────────────────────────────────
    submitQuiz(dto, userId) {
        return this.learningService.submitQuiz(dto, userId);
    }
    getUserQuizAttempts(userId, quizId) {
        return this.learningService.getUserQuizAttempts(userId, quizId);
    }
    // ─── Certificats ──────────────────────────────────────────
    generateCertificate(userId, courseId) {
        return this.learningService.generateCertificate(userId, courseId);
    }
    getUserCertificates(userId) {
        return this.learningService.getUserCertificates(userId);
    }
    verifyCertificate(uid) {
        return this.learningService.verifyCertificate(uid);
    }
    constructor(learningService){
        this.learningService = learningService;
    }
};
_ts_decorate([
    (0, _common.Post)('enrollments'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ENROLLMENT_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'S\'inscrire à un cours'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createenrollmentdto.CreateEnrollmentDto === "undefined" ? Object : _createenrollmentdto.CreateEnrollmentDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "enroll", null);
_ts_decorate([
    (0, _common.Get)('enrollments'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.ENROLLMENT_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes inscriptions'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "getUserEnrollments", null);
_ts_decorate([
    (0, _common.Post)('progress/:moduleId'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PROGRESS_UPDATE),
    (0, _swagger.ApiOperation)({
        summary: 'Mettre à jour la progression d\'un module'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Param)('moduleId')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _updateprogressdto.UpdateProgressDto === "undefined" ? Object : _updateprogressdto.UpdateProgressDto
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "updateProgress", null);
_ts_decorate([
    (0, _common.Get)('progress/:courseId'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.PROGRESS_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Progression dans un cours'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Param)('courseId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "getUserProgress", null);
_ts_decorate([
    (0, _common.Post)('quiz/submit'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.QUIZ_ATTEMPT),
    (0, _swagger.ApiOperation)({
        summary: 'Soumettre un quiz'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _submitquizdto.SubmitQuizDto === "undefined" ? Object : _submitquizdto.SubmitQuizDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "submitQuiz", null);
_ts_decorate([
    (0, _common.Get)('quiz/:quizId/attempts'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.QUIZ_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes tentatives pour un quiz'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Param)('quizId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "getUserQuizAttempts", null);
_ts_decorate([
    (0, _common.Post)('certificates/:courseId'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.CERTIFICATE_CREATE),
    (0, _swagger.ApiOperation)({
        summary: 'Générer un certificat'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_param(1, (0, _common.Param)('courseId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "generateCertificate", null);
_ts_decorate([
    (0, _common.Get)('certificates'),
    (0, _permissionsdecorator.RequirePermissions)(_permissions.Permissions.CERTIFICATE_READ),
    (0, _swagger.ApiOperation)({
        summary: 'Mes certificats'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "getUserCertificates", null);
_ts_decorate([
    (0, _common.Get)('certificates/verify/:uid'),
    (0, _swagger.ApiOperation)({
        summary: 'Vérifier un certificat par UID'
    }),
    _ts_param(0, (0, _common.Param)('uid')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LearningController.prototype, "verifyCertificate", null);
LearningController = _ts_decorate([
    (0, _swagger.ApiTags)('Learning'),
    (0, _common.Controller)(),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt'), _rolesguard.RolesGuard, _permissionsguard.PermissionsGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _learningservice.LearningService === "undefined" ? Object : _learningservice.LearningService
    ])
], LearningController);

//# sourceMappingURL=learning.controller.js.map