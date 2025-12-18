import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUUID,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProjectType {
  INFRASTRUCTURE = 'infrastructure',
  EXPANSION = 'expansion',
  MAINTENANCE = 'maintenance',
  MIGRATION = 'migration',
  SOLAR = 'solar',
  NETWORK = 'network',
  OTHER = 'other',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'رقم المشروع الفريد',
    example: 'PROJ-2025-001',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  projectNumber: string;

  @ApiProperty({
    description: 'اسم المشروع',
    example: 'محطة الطاقة الشمسية - المنطقة الشرقية',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'وصف المشروع',
    example: 'إنشاء محطة طاقة شمسية بقدرة 1 ميجاوات',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'نوع المشروع',
    enum: ProjectType,
    example: ProjectType.SOLAR,
  })
  @IsEnum(ProjectType)
  @IsNotEmpty()
  projectType: ProjectType;

  @ApiPropertyOptional({
    description: 'أهداف المشروع',
    example: 'توفير طاقة نظيفة للمنطقة الشرقية',
  })
  @IsString()
  @IsOptional()
  objectives?: string;

  @ApiPropertyOptional({
    description: 'نطاق العمل',
    example: 'تجهيز الموقع، تركيب الألواح، التوصيلات، الربط بالشبكة',
  })
  @IsString()
  @IsOptional()
  scope?: string;

  @ApiPropertyOptional({
    description: 'المخرجات المتوقعة',
    example: 'محطة طاقة شمسية جاهزة للعمل',
  })
  @IsString()
  @IsOptional()
  deliverables?: string;

  @ApiProperty({
    description: 'الميزانية التقديرية بالريال',
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedBudget: number;

  @ApiPropertyOptional({
    description: 'الميزانية المعتمدة بالريال',
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  approvedBudget?: number;

  @ApiPropertyOptional({
    description: 'العملة',
    example: 'SAR',
    default: 'SAR',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    description: 'تاريخ البدء المخطط',
    example: '2025-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedStartDate: string;

  @ApiProperty({
    description: 'تاريخ الانتهاء المخطط',
    example: '2025-06-30',
  })
  @IsDateString()
  @IsNotEmpty()
  plannedEndDate: string;

  @ApiPropertyOptional({
    description: 'تاريخ البدء الفعلي',
    example: '2025-01-20',
  })
  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @ApiPropertyOptional({
    description: 'تاريخ الانتهاء الفعلي',
    example: '2025-07-15',
  })
  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @ApiPropertyOptional({
    description: 'المدة بالأيام',
    example: 180,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationDays?: number;

  @ApiPropertyOptional({
    description: 'حالة المشروع',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'نسبة التقدم',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  progressPercent?: number;

  @ApiPropertyOptional({
    description: 'معرف مدير المشروع',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  projectManagerId?: string;

  @ApiPropertyOptional({
    description: 'معرف راعي المشروع',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  sponsorId?: string;

  @ApiPropertyOptional({
    description: 'المرفقات',
    example: [],
    type: [Object],
  })
  @IsArray()
  @IsOptional()
  attachments?: object[];
}
