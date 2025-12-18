import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class WorkflowActionDto {
  @ApiProperty({ description: 'معرف المستخدم الذي يقوم بالإجراء' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}
