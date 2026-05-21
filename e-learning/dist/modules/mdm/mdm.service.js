"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MdmService", {
    enumerable: true,
    get: function() {
        return MdmService;
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
let MdmService = class MdmService {
    async createHeadset(dto) {
        return this.prisma.vRHeadset.create({
            data: dto
        });
    }
    async getOrganizationHeadsets(organizationId) {
        return this.prisma.vRHeadset.findMany({
            where: {
                organizationId
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async updateHeadsetStatus(id, status, batteryLevel) {
        const headset = await this.prisma.vRHeadset.findUnique({
            where: {
                id
            }
        });
        if (!headset) throw new _common.NotFoundException('Casque VR non trouvé');
        return this.prisma.vRHeadset.update({
            where: {
                id
            },
            data: {
                status: status,
                batteryLevel,
                lastPing: new Date()
            }
        });
    }
    async assignHeadset(id, userId) {
        return this.prisma.vRHeadset.update({
            where: {
                id
            },
            data: {
                assignedUserId: userId,
                status: 'IN_USE'
            }
        });
    }
    // ─── Stations de charge ─────────────────────────────────────
    async createChargingStation(data) {
        return this.prisma.chargingStation.create({
            data
        });
    }
    async getOrganizationChargingStations(organizationId) {
        return this.prisma.chargingStation.findMany({
            where: {
                organizationId
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
MdmService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], MdmService);

//# sourceMappingURL=mdm.service.js.map