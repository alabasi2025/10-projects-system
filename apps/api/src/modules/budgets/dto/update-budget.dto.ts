import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateBudgetDto {
  @ApiPropertyOptional({
    description: 'الميزانية الأصلية',
    example: 5000000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  originalBudget?: number;

  @ApiPropertyOptional({
    description: 'التعديلات',
    example: 500000,
  })
  @IsNumber()
  @IsOptional()
  adjustments?: number;

  @ApiPropertyOptional({
    description: 'الميزانية الحالية',
    example: 5500000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentBudget?: number;

  @ApiPropertyOptional({
    description: 'المبلغ الملتزم به',
    example: 1000000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  committedAmount?: number;

  @ApiPropertyOptional({
    description: 'المبلغ المصروف',
    example: 500000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  spentAmount?: number;

  @ApiPropertyOptional({
    description: 'نسبة الالتزام',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  commitmentPercent?: number;

  @ApiPropertyOptional({
    description: 'نسبة الصرف',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  spentPercent?: number;

  @ApiPropertyOptional({
    description: 'حالة الميزانية',
    example: 'active',
    enum: ['draft', 'pending_approval', 'active', 'closed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;
}
