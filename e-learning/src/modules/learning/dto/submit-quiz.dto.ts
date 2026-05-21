import { IsString, IsArray, ValidateNested, IsOptional, Allow } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty()
  @Allow()
  answer: any;
}

export class SubmitQuizDto {
  @ApiProperty()
  @IsString()
  quizId: string;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startedAt?: string;
}
