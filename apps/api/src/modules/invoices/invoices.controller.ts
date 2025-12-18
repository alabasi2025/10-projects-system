import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, WorkflowActionDto } from './dto';

@ApiTags('Invoices - المستخلصات')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * إنشاء مستخلص جديد
   */
  @Post()
  @ApiOperation({ summary: 'إنشاء مستخلص جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المستخلص بنجاح' })
  async create(@Body() dto: CreateInvoiceDto) {
    const invoice = await this.invoicesService.create({
      ...dto,
      invoiceDate: new Date(dto.invoiceDate),
    });
    return {
      success: true,
      data: invoice,
      message: 'تم إنشاء المستخلص بنجاح',
    };
  }

  /**
   * الحصول على قائمة المستخلصات
   */
  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة المستخلصات' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'contractorId', required: false, type: String })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('contractorId') contractorId?: string,
    @Query('contractId') contractId?: string,
    @Query('projectId') projectId?: string,
  ) {
    const result = await this.invoicesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      status,
      contractorId,
      contractId,
      projectId,
    });
    return {
      success: true,
      ...result,
    };
  }

  /**
   * توليد رقم مستخلص جديد
   */
  @Get('generate-number')
  @ApiOperation({ summary: 'توليد رقم مستخلص جديد' })
  async generateNumber() {
    const number = await this.invoicesService.generateNumber();
    return {
      success: true,
      data: { number },
    };
  }

  /**
   * الحصول على إحصائيات المستخلصات
   */
  @Get('statistics')
  @ApiOperation({ summary: 'الحصول على إحصائيات المستخلصات' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  async getStatistics(@Query('projectId') projectId?: string) {
    const statistics = await this.invoicesService.getStatistics(projectId);
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * الحصول على مستخلص بالمعرف
   */
  @Get(':id')
  @ApiOperation({ summary: 'الحصول على مستخلص بالمعرف' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);
    return {
      success: true,
      data: invoice,
    };
  }

  /**
   * تحديث مستخلص
   */
  @Put(':id')
  @ApiOperation({ summary: 'تحديث مستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const invoice = await this.invoicesService.update(id, dto);
    return {
      success: true,
      data: invoice,
      message: 'تم تحديث المستخلص بنجاح',
    };
  }

  /**
   * حذف مستخلص
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف مستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async remove(@Param('id') id: string) {
    await this.invoicesService.remove(id);
    return {
      success: true,
      message: 'تم حذف المستخلص بنجاح',
    };
  }

  // ==================== Workflow Actions ====================

  /**
   * تقديم المستخلص للمراجعة
   */
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تقديم المستخلص للمراجعة' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async submit(@Param('id') id: string) {
    const invoice = await this.invoicesService.submit(id);
    return {
      success: true,
      data: invoice,
      message: 'تم تقديم المستخلص للمراجعة',
    };
  }

  /**
   * بدء مراجعة المستخلص
   */
  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بدء مراجعة المستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async startReview(@Param('id') id: string, @Body() dto: WorkflowActionDto) {
    const invoice = await this.invoicesService.startReview(id, dto.userId);
    return {
      success: true,
      data: invoice,
      message: 'تم بدء مراجعة المستخلص',
    };
  }

  /**
   * الموافقة على المستخلص
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'الموافقة على المستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async approve(@Param('id') id: string, @Body() dto: WorkflowActionDto) {
    const invoice = await this.invoicesService.approve(id, dto.userId);
    return {
      success: true,
      data: invoice,
      message: 'تمت الموافقة على المستخلص',
    };
  }

  /**
   * رفض المستخلص
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'رفض المستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async reject(@Param('id') id: string, @Body() dto: WorkflowActionDto) {
    const invoice = await this.invoicesService.reject(id, dto.userId, dto.notes);
    return {
      success: true,
      data: invoice,
      message: 'تم رفض المستخلص',
    };
  }

  /**
   * تسجيل دفع المستخلص
   */
  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تسجيل دفع المستخلص' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async markAsPaid(@Param('id') id: string, @Body() dto: { paymentOrderId?: string }) {
    const invoice = await this.invoicesService.markAsPaid(id, dto.paymentOrderId);
    return {
      success: true,
      data: invoice,
      message: 'تم تسجيل دفع المستخلص',
    };
  }

  /**
   * إعادة المستخلص للمسودة
   */
  @Post(':id/revert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'إعادة المستخلص للمسودة' })
  @ApiParam({ name: 'id', description: 'معرف المستخلص' })
  async revertToDraft(@Param('id') id: string) {
    const invoice = await this.invoicesService.revertToDraft(id);
    return {
      success: true,
      data: invoice,
      message: 'تم إعادة المستخلص للمسودة',
    };
  }
}
