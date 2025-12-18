import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class UpdatePhaseDto {
  @ApiPropertyOptional({
    description: 'رقم المرحلة',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  phaseNumber?: number;

  @ApiPropertyOptional({
    description: 'اسم المرحلة',
    example: 'مرحلة التصميم',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'وصف المرحلة',
    example: 'تصميم المخططات الهندسية والمعمارية',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'الميزانية المخصصة',
    example: 500000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  allocatedBudget?: number;

  @ApiPropertyOptional({
    description: 'المبلغ المصروف',
    example: 150000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  spentAmount?: number;

  @ApiPropertyOptional({
    description: 'تاريخ البدء المخطط',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ الانتهاء المخطط',
    example: '2025-04-30',
  })
  @IsDateString()
  @IsOptional()
  plannedEndDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ البدء الفعلي',
    example: '2025-02-05',
  })
  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ الانتهاء الفعلي',
    example: '2025-05-10',
  })
  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @ApiPropertyOptional({
    description: 'حالة المرحلة',
    example: 'in_progress',
    enum: ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'نسبة التقدم',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({
    description: 'ترتيب المرحلة',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  sequenceOrder?: number;

  @ApiPropertyOptional({
    description: 'معرف المرحلة التي تعتمد عليها',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  dependsOnPhaseId?: string;
}
