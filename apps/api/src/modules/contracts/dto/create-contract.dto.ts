import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ description: 'رقم العقد', example: 'CNT-2025-001' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ description: 'معرف المقاول' })
  @IsUUID()
  contractorId: string;

  @ApiPropertyOptional({ description: 'معرف المشروع' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'نوع العقد', example: 'fixed_price' })
  @IsString()
  contractType: string;

  @ApiProperty({ description: 'قيمة العقد', example: 500000 })
  @IsNumber()
  @Min(0)
  contractValue: number;

  @ApiPropertyOptional({ description: 'العملة', default: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'تاريخ البدء' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'تاريخ الانتهاء' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'الشروط والأحكام' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'شروط الدفع' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'فترة الضمان بالأيام' })
  @IsOptional()
  @IsNumber()
  warrantyPeriod?: number;

  @ApiPropertyOptional({ description: 'الحالة', default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;
}
