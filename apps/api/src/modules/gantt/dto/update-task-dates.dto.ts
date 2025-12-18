import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsIn } from 'class-validator';

export class UpdateTaskDatesDto {
  @ApiProperty({
    description: 'نوع المهمة',
    enum: ['phase', 'work_package'],
    example: 'phase',
  })
  @IsString()
  @IsIn(['phase', 'work_package'])
  taskType: 'phase' | 'work_package';

  @ApiProperty({
    description: 'تاريخ البدء الجديد',
    example: '2025-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'تاريخ الانتهاء الجديد',
    example: '2025-03-31',
  })
  @IsDateString()
  endDate: string;
}
