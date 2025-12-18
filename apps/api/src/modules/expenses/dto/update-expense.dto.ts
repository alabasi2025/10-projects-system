import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
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
    description: 'وصف المصروف',
    example: 'شراء مواد بناء للمرحلة الأولى',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'المبلغ',
    example: 50000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

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

  @ApiPropertyOptional({
    description: 'تاريخ المصروف',
    example: '2025-02-15',
  })
  @IsDateString()
  @IsOptional()
  expenseDate?: string;

  @ApiPropertyOptional({
    description: 'معرف القيد المحاسبي',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  @IsUUID()
  @IsOptional()
  journalEntryId?: string;
}
