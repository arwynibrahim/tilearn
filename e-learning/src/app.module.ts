import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '60', 10),
    }]),
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
