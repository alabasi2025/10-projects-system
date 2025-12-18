import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * تقرير حالة المشاريع
   */
  async getProjectsStatusReport(params: {
    status?: string;
    projectType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { status, projectType, startDate, endDate } = params;

    const where: any = {};
    if (status) where.status = status;
    if (projectType) where.projectType = projectType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const projects = await this.prisma.projProject.findMany({
      where,
      include: {
        phases: {
          select: {
            id: true,
            name: true,
            status: true,
            progressPercent: true,
          },
        },
        _count: {
          select: {
            phases: true,
            workPackages: true,
            expenses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // حساب الإحصائيات
    const summary = {
      totalProjects: projects.length,
      byStatus: {} as { [key: string]: number },
      byType: {} as { [key: string]: number },
      totalBudget: 0,
      averageProgress: 0,
    };

    let totalProgress = 0;
    for (const project of projects) {
      summary.byStatus[project.status] = (summary.byStatus[project.status] || 0) + 1;
      summary.byType[project.projectType] = (summary.byType[project.projectType] || 0) + 1;
      summary.totalBudget += Number(project.estimatedBudget) || 0;
      totalProgress += Number(project.progressPercent) || 0;
    }
    summary.averageProgress = projects.length > 0 ? totalProgress / projects.length : 0;

    return {
      summary,
      projects: projects.map(p => ({
        id: p.id,
        projectNumber: p.projectNumber,
        name: p.name,
        projectType: p.projectType,
        status: p.status,
        estimatedBudget: Number(p.estimatedBudget),
        approvedBudget: Number(p.approvedBudget) || null,
        progressPercent: Number(p.progressPercent),
        plannedStartDate: p.plannedStartDate,
        plannedEndDate: p.plannedEndDate,
        actualStartDate: p.actualStartDate,
        actualEndDate: p.actualEndDate,
        phasesCount: p._count.phases,
        workPackagesCount: p._count.workPackages,
        expensesCount: p._count.expenses,
        phases: p.phases,
      })),
    };
  }

  /**
   * تقرير الميزانية والمصروفات
   */
  async getBudgetReport(params: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { projectId, startDate, endDate } = params;

    const projectWhere: any = {};
    if (projectId) projectWhere.id = projectId;

    const expenseWhere: any = {};
    if (projectId) expenseWhere.projectId = projectId;
    if (startDate || endDate) {
      expenseWhere.expenseDate = {};
      if (startDate) expenseWhere.expenseDate.gte = startDate;
      if (endDate) expenseWhere.expenseDate.lte = endDate;
    }

    const [projects, expenses, expensesByCategory] = await Promise.all([
      this.prisma.projProject.findMany({
        where: projectWhere,
        select: {
          id: true,
          projectNumber: true,
          name: true,
          estimatedBudget: true,
          approvedBudget: true,
          currency: true,
        },
      }),
      this.prisma.projProjectExpense.findMany({
        where: expenseWhere,
        include: {
          project: {
            select: {
              projectNumber: true,
              name: true,
            },
          },
        },
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.projProjectExpense.groupBy({
        by: ['expenseCategory'],
        where: expenseWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // حساب الإجماليات
    let totalEstimated = 0;
    let totalApproved = 0;
    let totalSpent = 0;

    for (const project of projects) {
      totalEstimated += Number(project.estimatedBudget) || 0;
      totalApproved += Number(project.approvedBudget) || 0;
    }

    for (const expense of expenses) {
      totalSpent += Number(expense.amount) || 0;
    }

    const categoryBreakdown = expensesByCategory.map(cat => ({
      category: cat.expenseCategory,
      amount: Number(cat._sum.amount) || 0,
      count: cat._count.id,
    }));

    return {
      summary: {
        totalEstimated,
        totalApproved,
        totalSpent,
        remaining: totalApproved - totalSpent,
        utilizationRate: totalApproved > 0 ? ((totalSpent / totalApproved) * 100).toFixed(2) : 0,
        expensesCount: expenses.length,
      },
      categoryBreakdown,
      projects: projects.map(p => {
        const projectExpenses = expenses.filter(e => e.projectId === p.id);
        const spent = projectExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          id: p.id,
          projectNumber: p.projectNumber,
          name: p.name,
          estimatedBudget: Number(p.estimatedBudget),
          approvedBudget: Number(p.approvedBudget) || null,
          spent,
          remaining: (Number(p.approvedBudget) || Number(p.estimatedBudget)) - spent,
          currency: p.currency,
        };
      }),
      expenses: expenses.map(e => ({
        id: e.id,
        projectNumber: e.project.projectNumber,
        projectName: e.project.name,
        expenseNumber: e.expenseNumber,
        description: e.description,
        category: e.expenseCategory,
        amount: Number(e.amount),
        expenseDate: e.expenseDate,
        status: e.status,
      })),
    };
  }

  /**
   * تقرير الأداء الزمني
   */
  async getTimePerformanceReport(params: {
    projectId?: string;
  }) {
    const { projectId } = params;

    const where: any = {};
    if (projectId) where.id = projectId;

    const projects = await this.prisma.projProject.findMany({
      where,
      include: {
        phases: {
          include: {
            workPackages: {
              select: {
                id: true,
                name: true,
                status: true,
                progressPercent: true,
                plannedStartDate: true,
                plannedEndDate: true,
                actualStartDate: true,
                actualEndDate: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    const today = new Date();
    
    const report = projects.map(project => {
      const plannedDuration = this.calculateDays(project.plannedStartDate, project.plannedEndDate);
      const actualDuration = project.actualEndDate 
        ? this.calculateDays(project.actualStartDate || project.plannedStartDate, project.actualEndDate)
        : this.calculateDays(project.actualStartDate || project.plannedStartDate, today);
      
      const isDelayed = project.status === 'in_progress' && project.plannedEndDate < today;
      const delayDays = isDelayed ? this.calculateDays(project.plannedEndDate, today) : 0;

      // حساب SPI (Schedule Performance Index)
      const plannedProgress = this.calculatePlannedProgress(project.plannedStartDate, project.plannedEndDate, today);
      const actualProgress = Number(project.progressPercent);
      const spi = plannedProgress > 0 ? actualProgress / plannedProgress : 1;

      return {
        id: project.id,
        projectNumber: project.projectNumber,
        name: project.name,
        status: project.status,
        plannedStartDate: project.plannedStartDate,
        plannedEndDate: project.plannedEndDate,
        actualStartDate: project.actualStartDate,
        actualEndDate: project.actualEndDate,
        plannedDuration,
        actualDuration,
        progressPercent: actualProgress,
        plannedProgress: Math.round(plannedProgress * 100) / 100,
        isDelayed,
        delayDays,
        spi: Math.round(spi * 100) / 100,
        phases: project.phases.map(phase => ({
          id: phase.id,
          name: phase.name,
          status: phase.status,
          progressPercent: Number(phase.progressPercent),
          plannedStartDate: phase.plannedStartDate,
          plannedEndDate: phase.plannedEndDate,
          actualStartDate: phase.actualStartDate,
          actualEndDate: phase.actualEndDate,
          workPackagesCount: phase.workPackages.length,
          completedWorkPackages: phase.workPackages.filter(wp => wp.status === 'completed').length,
        })),
      };
    });

    // حساب الإحصائيات
    const summary = {
      totalProjects: report.length,
      onTrack: report.filter(p => !p.isDelayed && p.spi >= 0.9).length,
      atRisk: report.filter(p => !p.isDelayed && p.spi < 0.9 && p.spi >= 0.7).length,
      delayed: report.filter(p => p.isDelayed || p.spi < 0.7).length,
      averageSPI: report.length > 0 ? report.reduce((sum, p) => sum + p.spi, 0) / report.length : 0,
      averageProgress: report.length > 0 ? report.reduce((sum, p) => sum + p.progressPercent, 0) / report.length : 0,
    };

    return {
      summary,
      projects: report,
    };
  }

  /**
   * تقرير المقاولين
   */
  async getContractorsReport() {
    const contractors = await this.prisma.projContractor.findMany({
      include: {
        contracts: {
          select: {
            id: true,
            contractNumber: true,
            contractValue: true,
            status: true,
          },
        },
        invoices: {
          select: {
            id: true,
            netAmount: true,
            status: true,
          },
        },
      },
    });

    const report = contractors.map(contractor => {
      const totalContractValue = contractor.contracts.reduce((sum, c) => sum + Number(c.contractValue), 0);
      const totalPaid = contractor.invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.netAmount), 0);
      const totalPending = contractor.invoices
        .filter(i => ['submitted', 'under_review', 'approved'].includes(i.status))
        .reduce((sum, i) => sum + Number(i.netAmount), 0);

      return {
        id: contractor.id,
        contractorCode: contractor.contractorCode,
        name: contractor.name,
        status: contractor.status,
        rating: Number(contractor.rating),
        totalProjects: contractor.totalProjects,
        completedProjects: contractor.completedProjects,
        contractsCount: contractor.contracts.length,
        totalContractValue,
        invoicesCount: contractor.invoices.length,
        totalPaid,
        totalPending,
      };
    });

    const summary = {
      totalContractors: report.length,
      activeContractors: report.filter(c => c.status === 'active').length,
      totalContractValue: report.reduce((sum, c) => sum + c.totalContractValue, 0),
      totalPaid: report.reduce((sum, c) => sum + c.totalPaid, 0),
      totalPending: report.reduce((sum, c) => sum + c.totalPending, 0),
    };

    return {
      summary,
      contractors: report,
    };
  }

  /**
   * حساب عدد الأيام بين تاريخين
   */
  private calculateDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * حساب التقدم المخطط بناءً على التاريخ
   */
  private calculatePlannedProgress(start: Date, end: Date, current: Date): number {
    if (current <= start) return 0;
    if (current >= end) return 100;
    
    const totalDays = this.calculateDays(start, end);
    const elapsedDays = this.calculateDays(start, current);
    
    return (elapsedDays / totalDays) * 100;
  }
}
