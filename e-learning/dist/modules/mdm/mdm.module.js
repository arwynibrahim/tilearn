"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MdmModule", {
    enumerable: true,
    get: function() {
        return MdmModule;
    }
});
const _common = require("@nestjs/common");
const _mdmcontroller = require("./mdm.controller");
const _mdmservice = require("./mdm.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let MdmModule = class MdmModule {
};
MdmModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _mdmcontroller.MdmController
        ],
        providers: [
            _mdmservice.MdmService
        ],
        exports: [
            _mdmservice.MdmService
        ]
    })
], MdmModule);

//# sourceMappingURL=mdm.module.js.map