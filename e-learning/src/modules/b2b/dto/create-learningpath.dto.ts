import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CourseInPathDto {
  @ApiProperty()
  @IsString()
  courseId: string;
}

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: [CourseInPathDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseInPathDto)
  courses: CourseInPathDto[];
}
