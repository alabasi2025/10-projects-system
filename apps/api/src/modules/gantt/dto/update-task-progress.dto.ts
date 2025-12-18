import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, Min, Max } from 'class-validator';

export class UpdateTaskProgressDto {
  @ApiProperty({
    description: 'نوع المهمة',
    enum: ['project', 'phase', 'work_package'],
    example: 'phase',
  })
  @IsString()
  @IsIn(['project', 'phase', 'work_package'])
  taskType: 'project' | 'phase' | 'work_package';

  @ApiProperty({
    description: 'نسبة التقدم (من 0 إلى 1)',
    example: 0.5,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  progress: number;
}
