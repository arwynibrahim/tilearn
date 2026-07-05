import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction au Cloud AWS' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ example: 'domain_id' })
  @IsString()
  domainId: string;

  @ApiPropertyOptional({ enum: CourseLevel, default: 'BEGINNER' })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ default: 'fr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Organisation propriétaire du cours (null = catalogue global)' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}
