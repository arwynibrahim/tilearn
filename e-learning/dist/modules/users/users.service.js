"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UsersService = class UsersService {
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    nom: true,
                    prenom: true,
                    role: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.user.count()
        ]);
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                telephone: true,
                avatar: true,
                role: true,
                createdAt: true,
                lastLoginAt: true
            }
        });
        if (!user) throw new _common.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.user.update({
            where: {
                id
            },
            data: dto,
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                updatedAt: true
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date()
            }
        });
        return {
            message: 'Utilisateur supprimé'
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map