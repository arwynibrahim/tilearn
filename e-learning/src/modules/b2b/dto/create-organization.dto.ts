import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'admin@universite.bf', description: 'Email du responsable qui recevra les accès' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  adminPrenom: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  adminNom: string;
}
