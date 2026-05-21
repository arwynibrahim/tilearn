import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VRHeadsetModel } from '@prisma/client';

export class CreateVRHeadsetDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  serialNumber: string;

  @ApiProperty({ enum: VRHeadsetModel })
  @IsEnum(VRHeadsetModel)
  model: VRHeadsetModel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  batteryLevel?: number;
}
