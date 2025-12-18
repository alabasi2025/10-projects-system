import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'معرف المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({
    description: 'إصدار الميزانية',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  budgetVersion?: number;

  @ApiProperty({
    description: 'الميزانية الأصلية',
    example: 5000000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  originalBudget: number;

  @ApiPropertyOptional({
    description: 'التعديلات',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  adjustments?: number;

  @ApiProperty({
    description: 'الميزانية الحالية',
    example: 5000000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  currentBudget: number;

  @ApiPropertyOptional({
    description: 'المبلغ الملتزم به',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  committedAmount?: number;

  @ApiPropertyOptional({
    description: 'المبلغ المصروف',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  spentAmount?: number;

  @ApiPropertyOptional({
    description: 'حالة الميزانية',
    example: 'active',
    enum: ['draft', 'pending_approval', 'active', 'closed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;
}
