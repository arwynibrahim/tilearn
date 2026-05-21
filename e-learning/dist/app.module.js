"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _throttler = require("@nestjs/throttler");
const _core = require("@nestjs/core");
const _prismamodule = require("./prisma/prisma.module");
const _authmodule = require("./modules/auth/auth.module");
const _usersmodule = require("./modules/users/users.module");
const _cataloguemodule = require("./modules/catalogue/catalogue.module");
const _vrmodule = require("./modules/vr/vr.module");
const _learningmodule = require("./modules/learning/learning.module");
const _paymentmodule = require("./modules/payment/payment.module");
const _b2bmodule = require("./modules/b2b/b2b.module");
const _mdmmodule = require("./modules/mdm/mdm.module");
const _instructormodule = require("./modules/instructor/instructor.module");
const _marketplacemodule = require("./modules/marketplace/marketplace.module");
const _emailmodule = require("./modules/email/email.module");
const _rolesmodule = require("./modules/roles/roles.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env'
            }),
            _throttler.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
                    limit: parseInt(process.env.THROTTLE_LIMIT || '60', 10)
                }
            ]),
            _prismamodule.PrismaModule,
            _authmodule.AuthModule,
            _usersmodule.UsersModule,
            _cataloguemodule.CatalogueModule,
            _vrmodule.VrModule,
            _learningmodule.LearningModule,
            _paymentmodule.PaymentModule,
            _b2bmodule.B2bModule,
            _mdmmodule.MdmModule,
            _instructormodule.InstructorModule,
            _marketplacemodule.MarketplaceModule,
            _emailmodule.EmailModule,
            _rolesmodule.RolesModule
        ],
        providers: [
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map