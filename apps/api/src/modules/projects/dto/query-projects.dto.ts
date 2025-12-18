import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectType } from './create-project.dto';

export class QueryProjectsDto {
  @ApiPropertyOptional({
    description: 'البحث في اسم المشروع أو الرقم',
    example: 'طاقة شمسية',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'فلترة حسب حالة المشروع',
    enum: ProjectStatus,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'فلترة حسب نوع المشروع',
    enum: ProjectType,
  })
  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType;

  @ApiPropertyOptional({
    description: 'رقم الصفحة',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'عدد العناصر في الصفحة',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'ترتيب حسب الحقل',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'اتجاه الترتيب',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
