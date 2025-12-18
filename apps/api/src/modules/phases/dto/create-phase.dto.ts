import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'رقم المرحلة',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  phaseNumber: number;

  @ApiProperty({
    description: 'اسم المرحلة',
    example: 'مرحلة التصميم',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

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

  @ApiProperty({
    description: 'تاريخ البدء المخطط',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedStartDate: string;

  @ApiProperty({
    description: 'تاريخ الانتهاء المخطط',
    example: '2025-04-30',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedEndDate: string;

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
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'نسبة التقدم',
    example: 0,
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
