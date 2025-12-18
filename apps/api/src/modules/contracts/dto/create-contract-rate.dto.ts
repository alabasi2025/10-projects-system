import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateContractRateDto {
  @ApiProperty({ description: 'كود الخدمة', example: 'SRV-001' })
  @IsString()
  serviceCode: string;

  @ApiProperty({ description: 'اسم الخدمة', example: 'أعمال الحفر' })
  @IsString()
  serviceName: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'الوحدة', example: 'متر مكعب' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'سعر الوحدة', example: 150 })
  @IsNumber()
  @Min(0)
  unitRate: number;

  @ApiPropertyOptional({ description: 'الحد الأدنى للكمية' })
  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى للكمية' })
  @IsOptional()
  @IsNumber()
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'نشط', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
