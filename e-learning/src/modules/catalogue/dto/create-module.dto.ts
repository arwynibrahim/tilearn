import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleType } from '@prisma/client';

export class CreateModuleDto {
  @ApiProperty({ example: 'course_id' })
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'Introduction à AWS EC2' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ModuleType })
  @IsEnum(ModuleType)
  type: ModuleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  isRequired?: boolean;
}
