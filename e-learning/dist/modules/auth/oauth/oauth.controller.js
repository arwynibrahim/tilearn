"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OAuthController", {
    enumerable: true,
    get: function() {
        return OAuthController;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _swagger = require("@nestjs/swagger");
const _authservice = require("../auth.service");
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
let OAuthController = class OAuthController {
    // ─── Google ────────────────────────────────────────────────
    googleLogin() {}
    async googleCallback(req) {
        return this.authService.loginOrRegisterOAuth(req.user);
    }
    // ─── LinkedIn ──────────────────────────────────────────────
    linkedinLogin() {}
    async linkedinCallback(req) {
        return this.authService.loginOrRegisterOAuth(req.user);
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _common.Get)('google'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('google')),
    (0, _swagger.ApiOperation)({
        summary: 'Connexion via Google OAuth'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], OAuthController.prototype, "googleLogin", null);
_ts_decorate([
    (0, _common.Get)('google/callback'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('google')),
    (0, _swagger.ApiOperation)({
        summary: 'Callback Google OAuth'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], OAuthController.prototype, "googleCallback", null);
_ts_decorate([
    (0, _common.Get)('linkedin'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('linkedin')),
    (0, _swagger.ApiOperation)({
        summary: 'Connexion via LinkedIn OAuth'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], OAuthController.prototype, "linkedinLogin", null);
_ts_decorate([
    (0, _common.Get)('linkedin/callback'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('linkedin')),
    (0, _swagger.ApiOperation)({
        summary: 'Callback LinkedIn OAuth'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], OAuthController.prototype, "linkedinCallback", null);
OAuthController = _ts_decorate([
    (0, _swagger.ApiTags)('Auth'),
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], OAuthController);

//# sourceMappingURL=oauth.controller.js.map