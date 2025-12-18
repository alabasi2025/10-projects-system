import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWorkPackagesDto {
  @ApiPropertyOptional({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'معرف المرحلة',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  phaseId?: string;

  @ApiPropertyOptional({
    description: 'حالة حزمة العمل',
    example: 'in_progress',
    enum: ['draft', 'pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'معرف المقاول',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsOptional()
  contractorId?: string;

  @ApiPropertyOptional({
    description: 'البحث في الاسم أو الوصف',
    example: 'أساسات',
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
    example: 'packageNumber',
    enum: ['packageNumber', 'name', 'createdAt', 'progressPercent', 'estimatedCost'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'packageNumber';

  @ApiPropertyOptional({
    description: 'اتجاه الترتيب',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
