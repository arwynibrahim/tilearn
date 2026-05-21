import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LicensePlan } from '@prisma/client';

export class CreateLicenseDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty({ enum: LicensePlan })
  @IsEnum(LicensePlan)
  plan: LicensePlan;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}
