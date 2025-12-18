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

export class CreateWorkPackageDto {
  @ApiProperty({
    description: 'معرف المرحلة',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  phaseId: string;

  @ApiProperty({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'رقم حزمة العمل',
    example: 'WP-001',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  packageNumber: string;

  @ApiProperty({
    description: 'اسم حزمة العمل',
    example: 'تصميم الأساسات',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'وصف حزمة العمل',
    example: 'تصميم وتنفيذ أساسات المبنى الرئيسي',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'نطاق العمل',
    example: 'يشمل الحفر والصب والتسليح',
  })
  @IsString()
  @IsOptional()
  scopeOfWork?: string;

  @ApiPropertyOptional({
    description: 'المخرجات',
    example: 'أساسات مكتملة ومعتمدة',
  })
  @IsString()
  @IsOptional()
  deliverables?: string;

  @ApiPropertyOptional({
    description: 'معايير القبول',
    example: 'اجتياز فحص الجودة والمطابقة للمواصفات',
  })
  @IsString()
  @IsOptional()
  acceptanceCriteria?: string;

  @ApiPropertyOptional({
    description: 'التكلفة التقديرية',
    example: 100000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({
    description: 'المبلغ المتعاقد عليه',
    example: 95000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  contractedAmount?: number;

  @ApiPropertyOptional({
    description: 'تاريخ البدء المخطط',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ الانتهاء المخطط',
    example: '2025-03-15',
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
    example: '2025-03-20',
  })
  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @ApiPropertyOptional({
    description: 'المدة بالأيام',
    example: 45,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({
    description: 'حالة حزمة العمل',
    example: 'draft',
    enum: ['draft', 'pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
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
    description: 'معرف المقاول',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsOptional()
  contractorId?: string;

  @ApiPropertyOptional({
    description: 'معرف العقد',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsOptional()
  contractId?: string;

  @ApiPropertyOptional({
    description: 'معرف المشرف',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  @IsOptional()
  supervisorId?: string;
}
