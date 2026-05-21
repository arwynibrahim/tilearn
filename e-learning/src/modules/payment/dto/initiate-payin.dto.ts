import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiatePayinDto {
  @ApiProperty({ description: 'Montant en FCFA', example: 50000 })
  @IsNumber()
  @Min(9)
  amount: number;

  @ApiProperty({ description: 'Téléphone du client (ex: 226XXXXXXXX)', example: '22670000000' })
  @IsString()
  customerPhone: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  customerFirstname: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  customerLastname: string;

  @ApiProperty({ example: 'jean@email.com' })
  @IsString()
  customerEmail: string;

  @ApiPropertyOptional({ example: 'Abonnement Pro - Mensuel' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;
}
