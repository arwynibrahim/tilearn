import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Total Innovation Learning API')
    .setDescription('API de la plateforme e-learning TIL avec modules VR')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification et gestion utilisateurs')
    .addTag('Catalogue', 'Cours, domaines et modules')
    .addTag('VR', 'Expérience Réalité Virtuelle')
    .addTag('Learning', 'Inscriptions, progression, quiz et certificats')
    .addTag('Payment', 'Paiements et abonnements')
    .addTag('B2B', 'Organisations et licences institutionnelles')
    .addTag('MDM', 'Gestion de flotte de casques VR')
    .addTag('Instructor', 'Profils formateurs et avis')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  // Bind to 0.0.0.0 so the container is reachable on Railway / any PaaS
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 TIL API running on port ${port} (docs at /api/docs)`);
}

bootstrap();
