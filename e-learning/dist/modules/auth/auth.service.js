"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _config = require("@nestjs/config");
const _bcryptjs = require("bcryptjs");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _prismaservice = require("../../prisma/prisma.service");
const _emailservice = require("../email/email.service");
const _permissions = require("../roles/permissions");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AuthService = class AuthService {
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (existing) throw new _common.ConflictException('Cet email est déjà utilisé');
        const passwordHash = await (0, _bcryptjs.hash)(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                nom: dto.nom,
                prenom: dto.prenom,
                telephone: dto.telephone,
                role: dto.role || 'LEARNER'
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true
            }
        });
        const tokens = await this.generateTokens(user);
        return {
            user,
            ...tokens
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                nom: true,
                prenom: true,
                role: true
            }
        });
        if (!user) throw new _common.UnauthorizedException('Email ou mot de passe incorrect');
        const valid = await (0, _bcryptjs.compare)(dto.password, user.passwordHash);
        if (!valid) throw new _common.UnauthorizedException('Email ou mot de passe incorrect');
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                lastLoginAt: new Date()
            }
        });
        const { passwordHash, ...safeUser } = user;
        const tokens = await this.generateTokens(safeUser);
        return {
            user: safeUser,
            ...tokens
        };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) {
            return {
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            };
        }
        const resetToken = _crypto.randomBytes(32).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                resetToken,
                resetTokenExpiresAt
            }
        });
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
        await this.emailService.sendPasswordResetEmail(user.email, resetToken, frontendUrl);
        return {
            message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
        };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: dto.token,
                resetTokenExpiresAt: {
                    gte: new Date()
                }
            }
        });
        if (!user) {
            throw new _common.BadRequestException('Token invalide ou expiré');
        }
        const passwordHash = await (0, _bcryptjs.hash)(dto.password, 12);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiresAt: null
            }
        });
        return {
            message: 'Mot de passe réinitialisé avec succès'
        };
    }
    async generateTokens(user) {
        const permissions = _permissions.RolePermissions[user.role] || [];
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m'
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d'
            })
        ]);
        return {
            accessToken,
            refreshToken
        };
    }
    async refreshToken(user) {
        return this.generateTokens(user);
    }
    async loginOrRegisterOAuth(oauthUser) {
        if (!oauthUser.email) {
            throw new _common.UnauthorizedException('Email requis pour l\'authentification OAuth');
        }
        let user = await this.prisma.user.findUnique({
            where: {
                email: oauthUser.email
            }
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: oauthUser.email,
                    passwordHash: '',
                    nom: oauthUser.nom || '',
                    prenom: oauthUser.prenom || '',
                    avatar: oauthUser.avatar,
                    emailVerifiedAt: new Date()
                }
            });
        }
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                lastLoginAt: new Date(),
                avatar: oauthUser.avatar || user.avatar
            }
        });
        const tokens = await this.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role
            },
            ...tokens
        };
    }
    async getProfile(userId) {
        return this.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                telephone: true,
                avatar: true,
                role: true,
                emailVerifiedAt: true,
                lastLoginAt: true,
                createdAt: true
            }
        });
    }
    constructor(prisma, jwtService, configService, emailService){
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map