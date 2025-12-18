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
import { WorkPackagesService } from './work-packages.service';
import { CreateWorkPackageDto, UpdateWorkPackageDto, QueryWorkPackagesDto } from './dto';

@ApiTags('حزم العمل - Work Packages')
@Controller('work-packages')
export class WorkPackagesController {
  constructor(private readonly workPackagesService: WorkPackagesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء حزمة عمل جديدة' })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء حزمة العمل بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صالحة',
  })
  @ApiResponse({
    status: 404,
    description: 'المرحلة أو المشروع غير موجود',
  })
  create(@Body() createWorkPackageDto: CreateWorkPackageDto) {
    return this.workPackagesService.create(createWorkPackageDto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة حزم العمل' })
  @ApiResponse({
    status: 200,
    description: 'قائمة حزم العمل',
  })
  findAll(@Query() query: QueryWorkPackagesDto) {
    return this.workPackagesService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات حزم العمل' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'معرف المشروع (اختياري)',
  })
  @ApiQuery({
    name: 'phaseId',
    required: false,
    description: 'معرف المرحلة (اختياري)',
  })
  @ApiResponse({
    status: 200,
    description: 'إحصائيات حزم العمل',
  })
  getStatistics(
    @Query('projectId') projectId?: string,
    @Query('phaseId') phaseId?: string,
  ) {
    return this.workPackagesService.getStatistics(projectId, phaseId);
  }

  @Get('phase/:phaseId')
  @ApiOperation({ summary: 'الحصول على حزم عمل مرحلة معينة' })
  @ApiParam({
    name: 'phaseId',
    description: 'معرف المرحلة',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'حزم عمل المرحلة مع الإحصائيات',
  })
  @ApiResponse({
    status: 404,
    description: 'المرحلة غير موجودة',
  })
  findByPhase(@Param('phaseId', ParseUUIDPipe) phaseId: string) {
    return this.workPackagesService.findByPhase(phaseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل حزمة عمل' })
  @ApiParam({
    name: 'id',
    description: 'معرف حزمة العمل',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل حزمة العمل',
  })
  @ApiResponse({
    status: 404,
    description: 'حزمة العمل غير موجودة',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث حزمة عمل' })
  @ApiParam({
    name: 'id',
    description: 'معرف حزمة العمل',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث حزمة العمل بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'حزمة العمل غير موجودة',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkPackageDto: UpdateWorkPackageDto,
  ) {
    return this.workPackagesService.update(id, updateWorkPackageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف حزمة عمل' })
  @ApiParam({
    name: 'id',
    description: 'معرف حزمة العمل',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف حزمة العمل بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن حذف حزمة العمل',
  })
  @ApiResponse({
    status: 404,
    description: 'حزمة العمل غير موجودة',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workPackagesService.remove(id);
  }
}
