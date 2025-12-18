import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

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

  @ApiProperty({
    description: 'نوع المصروف',
    example: 'material',
    enum: ['contractor_payment', 'material', 'labor', 'equipment', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  expenseType: string;

  @ApiPropertyOptional({
    description: 'وصف المصروف',
    example: 'شراء مواد بناء للمرحلة الأولى',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'المبلغ',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'نوع المرجع',
    example: 'invoice',
  })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional({
    description: 'معرف المرجع',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @IsUUID()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({
    description: 'تاريخ المصروف',
    example: '2025-02-15',
  })
  @IsDateString()
  @IsNotEmpty()
  expenseDate: string;

  @ApiPropertyOptional({
    description: 'معرف المستخدم المنشئ',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'إنشاء قيد محاسبي تلقائياً',
    example: true,
  })
  @IsOptional()
  createJournalEntry?: boolean;
}
