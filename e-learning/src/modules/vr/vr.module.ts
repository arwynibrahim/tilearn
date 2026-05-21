import { Module } from '@nestjs/common';
import { VrController } from './vr.controller';
import { VrService } from './vr.service';

@Module({
  controllers: [VrController],
  providers: [VrService],
  exports: [VrService],
})
export class VrModule {}
