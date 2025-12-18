import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GanttService, GanttData, CriticalPathResult } from './gantt.service';
import { UpdateTaskDatesDto, UpdateTaskProgressDto } from './dto';

@ApiTags('Gantt Chart - مخطط جانت')
@Controller('projects/:projectId/gantt')
export class GanttController {
  constructor(private readonly ganttService: GanttService) {}

  /**
   * الحصول على بيانات مخطط جانت
   */
  @Get()
  @ApiOperation({
    summary: 'الحصول على بيانات مخطط جانت',
    description: 'جلب جميع المهام والروابط لعرضها في مخطط جانت',
  })
  @ApiParam({ name: 'projectId', description: 'معرف المشروع' })
  @ApiResponse({
    status: 200,
    description: 'تم جلب بيانات مخطط جانت بنجاح',
  })
  async getGanttData(@Param('projectId') projectId: string): Promise<{
    success: boolean;
    data: GanttData;
  }> {
    const data = await this.ganttService.getGanttData(projectId);
    return {
      success: true,
      data,
    };
  }

  /**
   * حساب المسار الحرج
   */
  @Get('critical-path')
  @ApiOperation({
    summary: 'حساب المسار الحرج',
    description: 'حساب المسار الحرج للمشروع وتحديد المهام الحرجة',
  })
  @ApiParam({ name: 'projectId', description: 'معرف المشروع' })
  @ApiResponse({
    status: 200,
    description: 'تم حساب المسار الحرج بنجاح',
  })
  async getCriticalPath(@Param('projectId') projectId: string): Promise<{
    success: boolean;
    data: CriticalPathResult;
  }> {
    const data = await this.ganttService.calculateCriticalPath(projectId);
    return {
      success: true,
      data,
    };
  }

  /**
   * تحديث تواريخ مهمة
   */
  @Put('tasks/:taskId/dates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تحديث تواريخ مهمة',
    description: 'تحديث تاريخ البدء والانتهاء لمهمة محددة',
  })
  @ApiParam({ name: 'projectId', description: 'معرف المشروع' })
  @ApiParam({ name: 'taskId', description: 'معرف المهمة' })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث التواريخ بنجاح',
  })
  async updateTaskDates(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDatesDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.ganttService.updateTaskDates(
      taskId,
      dto.taskType,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
    return {
      success: true,
      message: 'تم تحديث التواريخ بنجاح',
    };
  }

  /**
   * تحديث نسبة التقدم
   */
  @Put('tasks/:taskId/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تحديث نسبة التقدم',
    description: 'تحديث نسبة الإنجاز لمهمة محددة',
  })
  @ApiParam({ name: 'projectId', description: 'معرف المشروع' })
  @ApiParam({ name: 'taskId', description: 'معرف المهمة' })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث نسبة التقدم بنجاح',
  })
  async updateTaskProgress(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskProgressDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.ganttService.updateTaskProgress(taskId, dto.taskType, dto.progress);
    return {
      success: true,
      message: 'تم تحديث نسبة التقدم بنجاح',
    };
  }
}
