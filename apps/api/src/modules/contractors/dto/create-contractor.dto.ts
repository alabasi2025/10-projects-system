import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsArray, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class CreateContractorDto {
  @ApiProperty({ description: 'كود المقاول', example: 'CONT-001' })
  @IsString()
  contractorCode: string;

  @ApiProperty({ description: 'اسم المقاول', example: 'شركة البناء المتقدم' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم المقاول بالإنجليزية' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'اسم جهة الاتصال' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'نوع المقاول', example: 'construction' })
  @IsOptional()
  @IsString()
  contractorType?: string;

  @ApiPropertyOptional({ description: 'التخصصات', type: [String] })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiPropertyOptional({ description: 'رقم الترخيص' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'تاريخ انتهاء الترخيص' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiPropertyOptional({ description: 'اسم البنك' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'رقم الحساب البنكي' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'رقم الآيبان' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ description: 'الحالة', default: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
