import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mot2passe!Securise' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiPropertyOptional({ example: '+22670123456' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ enum: Role, default: 'LEARNER' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
