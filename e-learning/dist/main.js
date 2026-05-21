"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _config = require("@nestjs/config");
const _express = /*#__PURE__*/ _interop_require_wildcard(require("express"));
const _appmodule = require("./app.module");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        rawBody: true
    });
    const configService = app.get(_config.ConfigService);
    app.use(_express.json({
        limit: '10mb'
    }));
    app.use(_express.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    app.setGlobalPrefix('api', {
        exclude: [
            'health'
        ]
    });
    app.enableVersioning({
        type: _common.VersioningType.URI,
        defaultVersion: '1'
    });
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    });
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        }
    }));
    const swaggerConfig = new _swagger.DocumentBuilder().setTitle('Total Innovation Learning API').setDescription('API de la plateforme e-learning TIL avec modules VR').setVersion('1.0').addBearerAuth().addTag('Auth', 'Authentification et gestion utilisateurs').addTag('Catalogue', 'Cours, domaines et modules').addTag('VR', 'Expérience Réalité Virtuelle').addTag('Learning', 'Inscriptions, progression, quiz et certificats').addTag('Payment', 'Paiements et abonnements').addTag('B2B', 'Organisations et licences institutionnelles').addTag('MDM', 'Gestion de flotte de casques VR').addTag('Instructor', 'Profils formateurs et avis').build();
    const document = _swagger.SwaggerModule.createDocument(app, swaggerConfig);
    _swagger.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`🚀 TIL API running on http://localhost:${port}/api/docs`);
}
bootstrap();

//# sourceMappingURL=main.js.map