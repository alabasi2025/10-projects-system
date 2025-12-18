import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpensesDto {
  @ApiPropertyOptional({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'معرف المرحلة',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsOptional()
  phaseId?: string;

  @ApiPropertyOptional({
    description: 'معرف حزمة العمل',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsOptional()
  workPackageId?: string;

  @ApiPropertyOptional({
    description: 'نوع المصروف',
    example: 'material',
    enum: ['contractor_payment', 'material', 'labor', 'equipment', 'other'],
  })
  @IsString()
  @IsOptional()
  expenseType?: string;

  @ApiPropertyOptional({
    description: 'تاريخ البدء',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ الانتهاء',
    example: '2025-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'البحث في الوصف',
    example: 'مواد',
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
    example: 'expenseDate',
    enum: ['expenseDate', 'amount', 'createdAt'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'expenseDate';

  @ApiPropertyOptional({
    description: 'اتجاه الترتيب',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
