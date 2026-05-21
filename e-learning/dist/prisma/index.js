"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get PrismaModule () {
        return _prismamodule.PrismaModule;
    },
    get PrismaService () {
        return _prismaservice.PrismaService;
    }
});
const _prismamodule = require("./prisma.module");
const _prismaservice = require("./prisma.service");

//# sourceMappingURL=index.js.map