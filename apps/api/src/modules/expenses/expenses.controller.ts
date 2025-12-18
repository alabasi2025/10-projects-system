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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, QueryExpensesDto } from './dto';

@ApiTags('المصروفات - Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'إنشاء مصروف جديد',
    description: 'إنشاء مصروف جديد مع إنشاء قيد محاسبي تلقائياً (القاعدة الصارمة)'
  })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء المصروف بنجاح مع القيد المحاسبي',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صالحة أو رصيد غير كافٍ',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع أو الميزانية أو المرحلة غير موجودة',
  })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة المصروفات' })
  @ApiResponse({
    status: 200,
    description: 'قائمة المصروفات',
  })
  findAll(@Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'إحصائيات المصروفات' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'معرف المشروع (اختياري)',
  })
  @ApiResponse({
    status: 200,
    description: 'إحصائيات المصروفات',
  })
  getStatistics(@Query('projectId') projectId?: string) {
    return this.expensesService.getStatistics(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على تفاصيل مصروف' })
  @ApiParam({
    name: 'id',
    description: 'معرف المصروف',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل المصروف',
  })
  @ApiResponse({
    status: 404,
    description: 'المصروف غير موجود',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث مصروف' })
  @ApiParam({
    name: 'id',
    description: 'معرف المصروف',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المصروف بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المصروف غير موجود',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف مصروف' })
  @ApiParam({
    name: 'id',
    description: 'معرف المصروف',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف المصروف بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن حذف المصروف (معتمد أو مدفوع)',
  })
  @ApiResponse({
    status: 404,
    description: 'المصروف غير موجود',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.remove(id);
  }
}
