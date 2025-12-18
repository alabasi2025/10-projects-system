import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IntegrationService } from './integration.service';

@ApiTags('Integration - التكامل')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // ==================== حالة التكامل ====================

  /**
   * فحص حالة الاتصال بالأنظمة الخارجية
   */
  @Get('status')
  @ApiOperation({ summary: 'فحص حالة الاتصال بالأنظمة الخارجية' })
  async checkStatus() {
    const status = await this.integrationService.checkIntegrationStatus();
    return {
      success: true,
      data: status,
    };
  }

  // ==================== التكامل المحاسبي ====================

  /**
   * إنشاء قيد محاسبي للمصروف
   */
  @Post('accounting/expense/:expenseId')
  @ApiOperation({ summary: 'إنشاء قيد محاسبي للمصروف' })
  @ApiParam({ name: 'expenseId', description: 'معرف المصروف' })
  async createExpenseEntry(@Param('expenseId') expenseId: string) {
    const entry = await this.integrationService.createExpenseEntry(expenseId);
    return {
      success: !!entry,
      data: entry,
      message: entry ? 'تم إنشاء القيد المحاسبي بنجاح' : 'فشل في إنشاء القيد المحاسبي',
    };
  }

  /**
   * إنشاء قيد محاسبي للمستخلص
   */
  @Post('accounting/invoice/:invoiceId')
  @ApiOperation({ summary: 'إنشاء قيد محاسبي للمستخلص' })
  @ApiParam({ name: 'invoiceId', description: 'معرف المستخلص' })
  async createInvoiceEntry(@Param('invoiceId') invoiceId: string) {
    const entry = await this.integrationService.createInvoiceEntry(invoiceId);
    return {
      success: !!entry,
      data: entry,
      message: entry ? 'تم إنشاء القيد المحاسبي بنجاح' : 'فشل في إنشاء القيد المحاسبي',
    };
  }

  /**
   * إنشاء قيد محاسبي لدفع المستخلص
   */
  @Post('accounting/payment/:invoiceId')
  @ApiOperation({ summary: 'إنشاء قيد محاسبي لدفع المستخلص' })
  @ApiParam({ name: 'invoiceId', description: 'معرف المستخلص' })
  async createPaymentEntry(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { paymentOrderId: string },
  ) {
    const entry = await this.integrationService.createPaymentEntry(invoiceId, body.paymentOrderId);
    return {
      success: !!entry,
      data: entry,
      message: entry ? 'تم إنشاء قيد الدفع بنجاح' : 'فشل في إنشاء قيد الدفع',
    };
  }

  // ==================== التكامل مع الموارد البشرية ====================

  /**
   * جلب قائمة الموظفين من نظام HR
   */
  @Get('hr/employees')
  @ApiOperation({ summary: 'جلب قائمة الموظفين من نظام HR' })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getEmployees(
    @Query('department') department?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const employees = await this.integrationService.getEmployees({
      department,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    });
    return {
      success: true,
      data: employees,
    };
  }

  /**
   * جلب بيانات موظف محدد
   */
  @Get('hr/employees/:employeeId')
  @ApiOperation({ summary: 'جلب بيانات موظف محدد' })
  @ApiParam({ name: 'employeeId', description: 'معرف الموظف' })
  async getEmployee(@Param('employeeId') employeeId: string) {
    const employee = await this.integrationService.getEmployee(employeeId);
    return {
      success: !!employee,
      data: employee,
    };
  }

  /**
   * إضافة عضو لفريق المشروع من نظام HR
   */
  @Post('hr/projects/:projectId/team')
  @ApiOperation({ summary: 'إضافة عضو لفريق المشروع من نظام HR' })
  @ApiParam({ name: 'projectId', description: 'معرف المشروع' })
  async addTeamMember(
    @Param('projectId') projectId: string,
    @Body() body: { employeeId: string; role: string; responsibilities?: string },
  ) {
    try {
      const member = await this.integrationService.addTeamMemberFromHR(
        projectId,
        body.employeeId,
        body.role,
        body.responsibilities,
      );
      return {
        success: true,
        data: member,
        message: 'تم إضافة العضو لفريق المشروع بنجاح',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================== التكامل مع نظام الموردين ====================

  /**
   * مزامنة بيانات المقاول مع نظام الموردين
   */
  @Post('suppliers/sync/:contractorId')
  @ApiOperation({ summary: 'مزامنة بيانات المقاول مع نظام الموردين' })
  @ApiParam({ name: 'contractorId', description: 'معرف المقاول' })
  async syncContractor(@Param('contractorId') contractorId: string) {
    const supplier = await this.integrationService.syncContractorWithSuppliers(contractorId);
    return {
      success: !!supplier,
      data: supplier,
      message: supplier ? 'تمت المزامنة بنجاح' : 'فشل في المزامنة',
    };
  }

  /**
   * إنشاء أمر دفع في نظام الموردين
   */
  @Post('suppliers/payment-order/:invoiceId')
  @ApiOperation({ summary: 'إنشاء أمر دفع في نظام الموردين' })
  @ApiParam({ name: 'invoiceId', description: 'معرف المستخلص' })
  async createPaymentOrder(@Param('invoiceId') invoiceId: string) {
    const result = await this.integrationService.createPaymentOrder(invoiceId);
    return {
      success: result.success,
      data: result.paymentOrderId ? { paymentOrderId: result.paymentOrderId } : null,
      message: result.success ? 'تم إنشاء أمر الدفع بنجاح' : 'فشل في إنشاء أمر الدفع',
    };
  }
}
