"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CatalogueModule", {
    enumerable: true,
    get: function() {
        return CatalogueModule;
    }
});
const _common = require("@nestjs/common");
const _cataloguecontroller = require("./catalogue.controller");
const _catalogueservice = require("./catalogue.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CatalogueModule = class CatalogueModule {
};
CatalogueModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _cataloguecontroller.CatalogueController
        ],
        providers: [
            _catalogueservice.CatalogueService
        ],
        exports: [
            _catalogueservice.CatalogueService
        ]
    })
], CatalogueModule);

//# sourceMappingURL=catalogue.module.js.map