"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedInStrategy", {
    enumerable: true,
    get: function() {
        return LinkedInStrategy;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _passportlinkedinoauth2 = require("passport-linkedin-oauth2");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LinkedInStrategy = class LinkedInStrategy extends (0, _passport.PassportStrategy)(_passportlinkedinoauth2.Strategy, 'linkedin') {
    async validate(accessToken, refreshToken, profile, done) {
        const { name, emails, photos } = profile;
        const user = {
            email: emails?.[0]?.value,
            nom: name?.familyName || '',
            prenom: name?.givenName || '',
            avatar: photos?.[0]?.value,
            provider: 'linkedin',
            providerId: profile.id,
            accessToken
        };
        done(null, user);
    }
    constructor(configService){
        super({
            clientID: configService.get('LINKEDIN_CLIENT_ID'),
            clientSecret: configService.get('LINKEDIN_CLIENT_SECRET'),
            callbackURL: configService.get('LINKEDIN_CALLBACK_URL', 'http://localhost:3000/api/v1/auth/linkedin/callback'),
            scope: [
                'email',
                'profile',
                'openid'
            ]
        });
    }
};
LinkedInStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], LinkedInStrategy);

//# sourceMappingURL=linkedin.strategy.js.map