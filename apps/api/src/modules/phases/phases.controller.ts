import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PhasesService } from './phases.service';
import { CreatePhaseDto, UpdatePhaseDto, QueryPhasesDto } from './dto';

@ApiTags('المراحل - Phases')
@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مرحلة جديدة' })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء المرحلة بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صالحة',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  create(@Body() createPhaseDto: CreatePhaseDto) {
    return this.phasesService.create(createPhaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة المراحل' })
  @ApiResponse({
    status: 200,
    description: 'قائمة المراحل',
  })
  findAll(@Query() query: QueryPhasesDto) {
    return this.phasesService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات المراحل' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'معرف المشروع (اختياري)',
  })
  @ApiResponse({
    status: 200,
    description: 'إحصائيات المراحل',
  })
  getStatistics(@Query('projectId') projectId?: string) {
    return this.phasesService.getStatistics(projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'الحصول على مراحل مشروع معين' })
  @ApiParam({
    name: 'projectId',
    description: 'معرف المشروع',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'مراحل المشروع مع الإحصائيات',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.phasesService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل مرحلة' })
  @ApiParam({
    name: 'id',
    description: 'معرف المرحلة',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل المرحلة',
  })
  @ApiResponse({
    status: 404,
    description: 'المرحلة غير موجودة',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.phasesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث مرحلة' })
  @ApiParam({
    name: 'id',
    description: 'معرف المرحلة',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المرحلة بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المرحلة غير موجودة',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePhaseDto: UpdatePhaseDto,
  ) {
    return this.phasesService.update(id, updatePhaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف مرحلة' })
  @ApiParam({
    name: 'id',
    description: 'معرف المرحلة',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف المرحلة بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن حذف المرحلة',
  })
  @ApiResponse({
    status: 404,
    description: 'المرحلة غير موجودة',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.phasesService.remove(id);
  }
}
