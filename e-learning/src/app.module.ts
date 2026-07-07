import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { VrModule } from './modules/vr/vr.module';
import { LearningModule } from './modules/learning/learning.module';
import { PaymentModule } from './modules/payment/payment.module';
import { B2bModule } from './modules/b2b/b2b.module';
import { MdmModule } from './modules/mdm/mdm.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { EmailModule } from './modules/email/email.module';
import { RolesModule } from './modules/roles/roles.module';
import { HealthController } from './health/health.controller';

// Builds the throttler storage: Redis (e.g. Upstash) when REDIS_URL is set,
// otherwise `undefined` so @nestjs/throttler falls back to in-memory storage.
function buildThrottlerStorage() {
  const url = process.env.REDIS_URL;
  if (!url) return undefined;

  new Logger('ThrottlerModule').log('Rate-limiting via Redis (REDIS_URL détecté)');
  // Fail fast on a misconfigured/unreachable REDIS_URL instead of queueing
  // commands forever (which would silently hang every throttled endpoint).
  // ioredis auto-enables TLS for `rediss://` (Upstash) URLs.
  return new ThrottlerStorageRedisService(url, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000,
    retryStrategy: (times) => Math.min(times * 500, 5_000),
  });
}

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '60', 10),
      }],
      // Distributed rate-limiting when REDIS_URL is set (e.g. Upstash `rediss://…`);
      // falls back to in-memory storage otherwise.
      storage: buildThrottlerStorage(),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogueModule,
    VrModule,
    LearningModule,
    PaymentModule,
    B2bModule,
    MdmModule,
    InstructorModule,
    MarketplaceModule,
    EmailModule,
    RolesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
