"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VrService", {
    enumerable: true,
    get: function() {
        return VrService;
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
let VrService = class VrService {
    async createScene(dto) {
        const module = await this.prisma.module.findUnique({
            where: {
                id: dto.moduleId
            }
        });
        if (!module) throw new _common.NotFoundException('Module non trouvé');
        return this.prisma.vRScene.create({
            data: dto
        });
    }
    async findSceneByModule(moduleId) {
        const scene = await this.prisma.vRScene.findUnique({
            where: {
                moduleId
            }
        });
        if (!scene) throw new _common.NotFoundException('Scène VR non trouvée pour ce module');
        return scene;
    }
    async findOneScene(id) {
        const scene = await this.prisma.vRScene.findUnique({
            where: {
                id
            }
        });
        if (!scene) throw new _common.NotFoundException('Scène VR non trouvée');
        return scene;
    }
    async updateScene(id, dto) {
        await this.findOneScene(id);
        return this.prisma.vRScene.update({
            where: {
                id
            },
            data: dto
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
VrService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], VrService);

//# sourceMappingURL=vr.service.js.map