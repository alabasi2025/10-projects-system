import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPhasesDto {
  @ApiPropertyOptional({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'حالة المرحلة',
    example: 'in_progress',
    enum: ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'البحث في الاسم أو الوصف',
    example: 'تصميم',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'رقم الصفحة',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'عدد العناصر في الصفحة',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'ترتيب حسب',
    example: 'sequenceOrder',
    enum: ['sequenceOrder', 'phaseNumber', 'name', 'createdAt', 'progressPercent'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'sequenceOrder';

  @ApiPropertyOptional({
    description: 'اتجاه الترتيب',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
