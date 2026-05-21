"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _authservice = require("./auth.service");
const _registerdto = require("./dto/register.dto");
const _logindto = require("./dto/login.dto");
const _forgotpassworddto = require("./dto/forgot-password.dto");
const _resetpassworddto = require("./dto/reset-password.dto");
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
let AuthController = class AuthController {
    register(dto) {
        return this.authService.register(dto);
    }
    login(dto) {
        return this.authService.login(dto);
    }
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto);
    }
    resetPassword(dto) {
        return this.authService.resetPassword(dto);
    }
    refresh(user) {
        return this.authService.refreshToken(user);
    }
    getProfile(userId) {
        return this.authService.getProfile(userId);
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _common.Post)('register'),
    (0, _swagger.ApiOperation)({
        summary: 'Inscription utilisateur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RegisterDto === "undefined" ? Object : _registerdto.RegisterDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _common.Post)('login'),
    (0, _swagger.ApiOperation)({
        summary: 'Connexion utilisateur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _logindto.LoginDto === "undefined" ? Object : _logindto.LoginDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.Post)('forgot-password'),
    (0, _swagger.ApiOperation)({
        summary: 'Demander un lien de réinitialisation de mot de passe'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _forgotpassworddto.ForgotPasswordDto === "undefined" ? Object : _forgotpassworddto.ForgotPasswordDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
_ts_decorate([
    (0, _common.Post)('reset-password'),
    (0, _swagger.ApiOperation)({
        summary: 'Réinitialiser le mot de passe avec le token reçu par email'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _resetpassworddto.ResetPasswordDto === "undefined" ? Object : _resetpassworddto.ResetPasswordDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
_ts_decorate([
    (0, _common.Post)('refresh'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt')),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Rafraîchir le token'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
_ts_decorate([
    (0, _common.Get)('profile'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt')),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Obtenir le profil connecté'
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
AuthController = _ts_decorate([
    (0, _swagger.ApiTags)('Auth'),
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map