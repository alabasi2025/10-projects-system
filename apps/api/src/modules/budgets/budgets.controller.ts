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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto, QueryBudgetsDto } from './dto';

@ApiTags('الميزانيات - Budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء ميزانية جديدة' })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الميزانية بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صالحة',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة الميزانيات' })
  @ApiResponse({
    status: 200,
    description: 'قائمة الميزانيات',
  })
  findAll(@Query() query: QueryBudgetsDto) {
    return this.budgetsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات الميزانيات' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'معرف المشروع (اختياري)',
  })
  @ApiResponse({
    status: 200,
    description: 'إحصائيات الميزانيات',
  })
  getStatistics(@Query('projectId') projectId?: string) {
    return this.budgetsService.getStatistics(projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'الحصول على ميزانيات مشروع معين' })
  @ApiParam({
    name: 'projectId',
    description: 'معرف المشروع',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'ميزانيات المشروع مع الإحصائيات',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.budgetsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل ميزانية' })
  @ApiParam({
    name: 'id',
    description: 'معرف الميزانية',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل الميزانية',
  })
  @ApiResponse({
    status: 404,
    description: 'الميزانية غير موجودة',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.budgetsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث ميزانية' })
  @ApiParam({
    name: 'id',
    description: 'معرف الميزانية',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الميزانية بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الميزانية غير موجودة',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف ميزانية' })
  @ApiParam({
    name: 'id',
    description: 'معرف الميزانية',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الميزانية بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن حذف الميزانية',
  })
  @ApiResponse({
    status: 404,
    description: 'الميزانية غير موجودة',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.budgetsService.remove(id);
  }
}
