import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVRSceneDto {
  @ApiProperty()
  @IsString()
  moduleId: string;

  @ApiProperty({ example: 'Labo Cloud AWS Virtual' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  sceneData?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  interactions?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  branches?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fallback360Url?: string;
}
