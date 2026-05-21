"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RolesService", {
    enumerable: true,
    get: function() {
        return RolesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
const _permissions = require("./permissions");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RolesService = class RolesService {
    async getPermissionsForRole(role) {
        return _permissions.RolePermissions[role] || [];
    }
    async getUserPermissions(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        });
        if (!user) throw new _common.NotFoundException('Utilisateur non trouvé');
        return this.getPermissionsForRole(user.role);
    }
    async getAllPermissions() {
        const dbPerms = await this.prisma.permission.findMany({
            orderBy: [
                {
                    group: 'asc'
                },
                {
                    name: 'asc'
                }
            ]
        });
        const grouped = {};
        for (const perm of dbPerms){
            const group = perm.group || 'Autres';
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(perm);
        }
        return grouped;
    }
    async syncPermissionsToDb() {
        const allDefinedPerms = Object.entries(_permissions.Permissions).map(([key, name])=>({
                name: name,
                group: key.split('_')[0]
            }));
        for (const perm of allDefinedPerms){
            await this.prisma.permission.upsert({
                where: {
                    name: perm.name
                },
                update: {
                    group: perm.group
                },
                create: {
                    name: perm.name,
                    description: `Permission ${perm.name}`,
                    group: perm.group
                }
            });
        }
        const roleNames = Object.keys(_permissions.RolePermissions);
        for (const role of roleNames){
            const perms = _permissions.RolePermissions[role];
            for (const permName of perms){
                const perm = await this.prisma.permission.findUnique({
                    where: {
                        name: permName
                    }
                });
                if (perm) {
                    await this.prisma.rolePermission.upsert({
                        where: {
                            role_permissionId: {
                                role: role,
                                permissionId: perm.id
                            }
                        },
                        update: {},
                        create: {
                            role: role,
                            permissionId: perm.id
                        }
                    });
                }
            }
        }
        return {
            message: 'Permissions synchronisées'
        };
    }
    async getUserWithPermissions(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true
            }
        });
        if (!user) throw new _common.NotFoundException('Utilisateur non trouvé');
        const permissions = await this.getPermissionsForRole(user.role);
        return {
            ...user,
            permissions
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
RolesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], RolesService);

//# sourceMappingURL=roles.service.js.map