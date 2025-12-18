import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports - التقارير')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * تقرير حالة المشاريع
   */
  @Get('projects-status')
  @ApiOperation({ summary: 'تقرير حالة المشاريع' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'projectType', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async getProjectsStatusReport(
    @Query('status') status?: string,
    @Query('projectType') projectType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const data = await this.reportsService.getProjectsStatusReport({
      status,
      projectType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (format === 'csv') {
      const csv = this.convertProjectsToCSV(data.projects);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename=projects-status-report.csv');
      return csv;
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * تقرير الميزانية والمصروفات
   */
  @Get('budget')
  @ApiOperation({ summary: 'تقرير الميزانية والمصروفات' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async getBudgetReport(
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const data = await this.reportsService.getBudgetReport({
      projectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (format === 'csv') {
      const csv = this.convertBudgetToCSV(data);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename=budget-report.csv');
      return csv;
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * تقرير الأداء الزمني
   */
  @Get('time-performance')
  @ApiOperation({ summary: 'تقرير الأداء الزمني' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async getTimePerformanceReport(
    @Query('projectId') projectId?: string,
    @Query('format') format?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const data = await this.reportsService.getTimePerformanceReport({
      projectId,
    });

    if (format === 'csv') {
      const csv = this.convertTimePerformanceToCSV(data.projects);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename=time-performance-report.csv');
      return csv;
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * تقرير المقاولين
   */
  @Get('contractors')
  @ApiOperation({ summary: 'تقرير المقاولين' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async getContractorsReport(
    @Query('format') format?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const data = await this.reportsService.getContractorsReport();

    if (format === 'csv') {
      const csv = this.convertContractorsToCSV(data.contractors);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename=contractors-report.csv');
      return csv;
    }

    return {
      success: true,
      data,
    };
  }

  // ==================== CSV Conversion Helpers ====================

  private convertProjectsToCSV(projects: any[]): string {
    const headers = [
      'رقم المشروع',
      'اسم المشروع',
      'النوع',
      'الحالة',
      'الميزانية التقديرية',
      'الميزانية المعتمدة',
      'نسبة التقدم',
      'تاريخ البدء المخطط',
      'تاريخ الانتهاء المخطط',
      'عدد المراحل',
      'عدد حزم العمل',
    ];

    const rows = projects.map(p => [
      p.projectNumber,
      p.name,
      p.projectType,
      p.status,
      p.estimatedBudget,
      p.approvedBudget || '',
      p.progressPercent,
      this.formatDate(p.plannedStartDate),
      this.formatDate(p.plannedEndDate),
      p.phasesCount,
      p.workPackagesCount,
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private convertBudgetToCSV(data: any): string {
    const headers = [
      'رقم المشروع',
      'اسم المشروع',
      'الميزانية التقديرية',
      'الميزانية المعتمدة',
      'المصروفات',
      'المتبقي',
      'العملة',
    ];

    const rows = data.projects.map((p: any) => [
      p.projectNumber,
      p.name,
      p.estimatedBudget,
      p.approvedBudget || '',
      p.spent,
      p.remaining,
      p.currency,
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private convertTimePerformanceToCSV(projects: any[]): string {
    const headers = [
      'رقم المشروع',
      'اسم المشروع',
      'الحالة',
      'نسبة التقدم',
      'التقدم المخطط',
      'SPI',
      'متأخر',
      'أيام التأخير',
      'تاريخ البدء المخطط',
      'تاريخ الانتهاء المخطط',
    ];

    const rows = projects.map(p => [
      p.projectNumber,
      p.name,
      p.status,
      p.progressPercent,
      p.plannedProgress,
      p.spi,
      p.isDelayed ? 'نعم' : 'لا',
      p.delayDays,
      this.formatDate(p.plannedStartDate),
      this.formatDate(p.plannedEndDate),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private convertContractorsToCSV(contractors: any[]): string {
    const headers = [
      'كود المقاول',
      'اسم المقاول',
      'الحالة',
      'التقييم',
      'عدد العقود',
      'إجمالي قيمة العقود',
      'عدد المستخلصات',
      'إجمالي المدفوع',
      'إجمالي المعلق',
    ];

    const rows = contractors.map(c => [
      c.contractorCode,
      c.name,
      c.status,
      c.rating,
      c.contractsCount,
      c.totalContractValue,
      c.invoicesCount,
      c.totalPaid,
      c.totalPending,
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private arrayToCSV(data: any[][]): string {
    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    return BOM + data.map(row => 
      row.map(cell => {
        const str = String(cell ?? '');
        // Escape quotes and wrap in quotes if contains comma or quote
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
