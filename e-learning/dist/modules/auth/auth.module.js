"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _config = require("@nestjs/config");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
const _jwtstrategy = require("../../common/guards/jwt.strategy");
const _googlestrategy = require("./oauth/google.strategy");
const _linkedinstrategy = require("./oauth/linkedin.strategy");
const _oauthcontroller = require("./oauth/oauth.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _passport.PassportModule.register({
                defaultStrategy: 'jwt'
            }),
            _jwt.JwtModule.registerAsync({
                imports: [
                    _config.ConfigModule
                ],
                inject: [
                    _config.ConfigService
                ],
                useFactory: (config)=>({
                        privateKey: config.get('JWT_PRIVATE_KEY'),
                        publicKey: config.get('JWT_PUBLIC_KEY'),
                        signOptions: {
                            expiresIn: config.get('JWT_ACCESS_EXPIRATION', '15m'),
                            algorithm: 'RS256'
                        }
                    })
            })
        ],
        controllers: [
            _authcontroller.AuthController,
            _oauthcontroller.OAuthController
        ],
        providers: [
            _authservice.AuthService,
            _jwtstrategy.JwtStrategy,
            _googlestrategy.GoogleStrategy,
            _linkedinstrategy.LinkedInStrategy
        ],
        exports: [
            _authservice.AuthService,
            _jwt.JwtModule
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map