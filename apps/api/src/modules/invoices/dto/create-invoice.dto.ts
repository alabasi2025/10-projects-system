import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'معرف المقاول' })
  @IsUUID()
  contractorId: string;

  @ApiProperty({ description: 'معرف العقد' })
  @IsUUID()
  contractId: string;

  @ApiPropertyOptional({ description: 'معرف المشروع' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'رقم المستخلص', example: 'INV-202512-001' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'تاريخ المستخلص' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ description: 'المبلغ الإجمالي', example: 100000 })
  @IsNumber()
  @Min(0)
  grossAmount: number;

  @ApiPropertyOptional({ description: 'الخصومات', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;

  @ApiPropertyOptional({ description: 'مبلغ الاحتجاز', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionAmount?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}
