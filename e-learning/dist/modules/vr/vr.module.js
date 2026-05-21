"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VrModule", {
    enumerable: true,
    get: function() {
        return VrModule;
    }
});
const _common = require("@nestjs/common");
const _vrcontroller = require("./vr.controller");
const _vrservice = require("./vr.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let VrModule = class VrModule {
};
VrModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _vrcontroller.VrController
        ],
        providers: [
            _vrservice.VrService
        ],
        exports: [
            _vrservice.VrService
        ]
    })
], VrModule);

//# sourceMappingURL=vr.module.js.map