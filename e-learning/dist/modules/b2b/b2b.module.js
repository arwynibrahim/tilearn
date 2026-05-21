"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bModule", {
    enumerable: true,
    get: function() {
        return B2bModule;
    }
});
const _common = require("@nestjs/common");
const _b2bcontroller = require("./b2b.controller");
const _b2bservice = require("./b2b.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2bModule = class B2bModule {
};
B2bModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _b2bcontroller.B2bController
        ],
        providers: [
            _b2bservice.B2bService
        ],
        exports: [
            _b2bservice.B2bService
        ]
    })
], B2bModule);

//# sourceMappingURL=b2b.module.js.map