import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard - لوحة المعلومات')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * الحصول على الإحصائيات الشاملة
   */
  @Get('overview')
  @ApiOperation({ summary: 'الحصول على الإحصائيات الشاملة' })
  async getOverview() {
    const data = await this.dashboardService.getOverview();
    return {
      success: true,
      data,
    };
  }

  /**
   * إحصائيات المشاريع
   */
  @Get('projects')
  @ApiOperation({ summary: 'إحصائيات المشاريع' })
  async getProjectStatistics() {
    const data = await this.dashboardService.getProjectStatistics();
    return {
      success: true,
      data,
    };
  }

  /**
   * إحصائيات الميزانية
   */
  @Get('budget')
  @ApiOperation({ summary: 'إحصائيات الميزانية' })
  async getBudgetStatistics() {
    const data = await this.dashboardService.getBudgetStatistics();
    return {
      success: true,
      data,
    };
  }

  /**
   * إحصائيات المقاولين
   */
  @Get('contractors')
  @ApiOperation({ summary: 'إحصائيات المقاولين' })
  async getContractorStatistics() {
    const data = await this.dashboardService.getContractorStatistics();
    return {
      success: true,
      data,
    };
  }

  /**
   * إحصائيات المستخلصات
   */
  @Get('invoices')
  @ApiOperation({ summary: 'إحصائيات المستخلصات' })
  async getInvoiceStatistics() {
    const data = await this.dashboardService.getInvoiceStatistics();
    return {
      success: true,
      data,
    };
  }

  /**
   * المصروفات الشهرية
   */
  @Get('charts/monthly-expenses')
  @ApiOperation({ summary: 'بيانات الرسم البياني - المصروفات الشهرية' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getMonthlyExpenses(@Query('year') year?: number) {
    const data = await this.dashboardService.getMonthlyExpenses(year ? Number(year) : undefined);
    return {
      success: true,
      data,
    };
  }

  /**
   * تقدم المشاريع
   */
  @Get('charts/projects-progress')
  @ApiOperation({ summary: 'بيانات الرسم البياني - تقدم المشاريع' })
  async getProjectsProgress() {
    const data = await this.dashboardService.getProjectsProgress();
    return {
      success: true,
      data,
    };
  }

  /**
   * توزيع الميزانية
   */
  @Get('charts/budget-distribution')
  @ApiOperation({ summary: 'بيانات الرسم البياني - توزيع الميزانية' })
  async getBudgetDistribution() {
    const data = await this.dashboardService.getBudgetDistribution();
    return {
      success: true,
      data,
    };
  }

  /**
   * المشاريع المتأخرة
   */
  @Get('delayed-projects')
  @ApiOperation({ summary: 'المشاريع المتأخرة' })
  async getDelayedProjects() {
    const data = await this.dashboardService.getDelayedProjects();
    return {
      success: true,
      data,
    };
  }

  /**
   * المستخلصات المعلقة
   */
  @Get('pending-invoices')
  @ApiOperation({ summary: 'المستخلصات المعلقة' })
  async getPendingInvoices() {
    const data = await this.dashboardService.getPendingInvoices();
    return {
      success: true,
      data,
    };
  }
}
