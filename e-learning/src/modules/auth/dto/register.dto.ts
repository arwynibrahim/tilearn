import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  /** Seul LEARNER et INSTRUCTOR sont autorisés à l'inscription publique */
  @ApiPropertyOptional({ enum: ['LEARNER', 'INSTRUCTOR'], default: 'LEARNER' })
  @IsOptional()
  @IsIn(['LEARNER', 'INSTRUCTOR'])
  role?: 'LEARNER' | 'INSTRUCTOR';

  @ApiPropertyOptional({ example: ['Développement', 'Santé'], description: "Centres d'intérêt pour recommandations de cours" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
