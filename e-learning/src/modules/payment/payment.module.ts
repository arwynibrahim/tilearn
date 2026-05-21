import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { LigdiCashService } from './ligdicash/ligdicash.service';
import { LigdiCashController } from './ligdicash/ligdicash.controller';

@Module({
  controllers: [PaymentController, LigdiCashController],
  providers: [PaymentService, LigdiCashService],
  exports: [PaymentService, LigdiCashService],
})
export class PaymentModule {}
