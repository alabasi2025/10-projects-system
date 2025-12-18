import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * الحصول على الإحصائيات الشاملة
   */
  async getOverview() {
    const [
      projectStats,
      budgetStats,
      contractorStats,
      invoiceStats,
      recentProjects,
      recentInvoices,
    ] = await Promise.all([
      this.getProjectStatistics(),
      this.getBudgetStatistics(),
      this.getContractorStatistics(),
      this.getInvoiceStatistics(),
      this.getRecentProjects(),
      this.getRecentInvoices(),
    ]);

    return {
      projects: projectStats,
      budget: budgetStats,
      contractors: contractorStats,
      invoices: invoiceStats,
      recentProjects,
      recentInvoices,
    };
  }

  /**
   * إحصائيات المشاريع
   */
  async getProjectStatistics() {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.projProject.count(),
      this.prisma.projProject.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.projProject.groupBy({
        by: ['projectType'],
        _count: { projectType: true },
      }),
    ]);

    const statusCounts: { [key: string]: number } = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count.status;
    }

    const typeCounts: { [key: string]: number } = {};
    for (const item of byType) {
      typeCounts[item.projectType] = item._count.projectType;
    }

    // حساب متوسط التقدم
    const avgProgress = await this.prisma.projProject.aggregate({
      _avg: { progressPercent: true },
    });

    return {
      total,
      byStatus: statusCounts,
      byType: typeCounts,
      averageProgress: Number(avgProgress._avg.progressPercent) || 0,
      active: statusCounts['in_progress'] || 0,
      completed: statusCounts['completed'] || 0,
      onHold: statusCounts['on_hold'] || 0,
    };
  }

  /**
   * إحصائيات الميزانية
   */
  async getBudgetStatistics() {
    const projects = await this.prisma.projProject.findMany({
      select: {
        estimatedBudget: true,
        approvedBudget: true,
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    let totalEstimated = 0;
    let totalApproved = 0;
    let totalSpent = 0;

    for (const project of projects) {
      totalEstimated += Number(project.estimatedBudget) || 0;
      totalApproved += Number(project.approvedBudget) || 0;
      for (const expense of project.expenses) {
        totalSpent += Number(expense.amount) || 0;
      }
    }

    const remaining = totalApproved - totalSpent;
    const utilizationRate = totalApproved > 0 ? (totalSpent / totalApproved) * 100 : 0;

    return {
      totalEstimated,
      totalApproved,
      totalSpent,
      remaining,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
    };
  }

  /**
   * إحصائيات المقاولين
   */
  async getContractorStatistics() {
    const [total, byStatus, contractStats] = await Promise.all([
      this.prisma.projContractor.count(),
      this.prisma.projContractor.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.projContract.aggregate({
        _sum: { contractValue: true },
        _count: { id: true },
      }),
    ]);

    const statusCounts: { [key: string]: number } = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count.status;
    }

    return {
      total,
      byStatus: statusCounts,
      active: statusCounts['active'] || 0,
      totalContracts: contractStats._count.id,
      totalContractValue: Number(contractStats._sum.contractValue) || 0,
    };
  }

  /**
   * إحصائيات المستخلصات
   */
  async getInvoiceStatistics() {
    const [total, byStatus, totals] = await Promise.all([
      this.prisma.projContractorInvoice.count(),
      this.prisma.projContractorInvoice.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { netAmount: true },
      }),
      this.prisma.projContractorInvoice.aggregate({
        _sum: {
          grossAmount: true,
          netAmount: true,
        },
      }),
    ]);

    const statusCounts: { [key: string]: { count: number; amount: number } } = {};
    for (const item of byStatus) {
      statusCounts[item.status] = {
        count: item._count.status,
        amount: Number(item._sum.netAmount) || 0,
      };
    }

    return {
      total,
      byStatus: statusCounts,
      totalGrossAmount: Number(totals._sum.grossAmount) || 0,
      totalNetAmount: Number(totals._sum.netAmount) || 0,
      pending: (statusCounts['submitted']?.count || 0) + (statusCounts['under_review']?.count || 0),
      approved: statusCounts['approved']?.count || 0,
      paid: statusCounts['paid']?.count || 0,
    };
  }

  /**
   * أحدث المشاريع
   */
  async getRecentProjects(limit = 5) {
    return this.prisma.projProject.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        projectNumber: true,
        name: true,
        status: true,
        progressPercent: true,
        estimatedBudget: true,
        plannedEndDate: true,
        createdAt: true,
      },
    });
  }

  /**
   * أحدث المستخلصات
   */
  async getRecentInvoices(limit = 5) {
    return this.prisma.projContractorInvoice.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        netAmount: true,
        status: true,
        contractor: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * بيانات الرسم البياني - المصروفات الشهرية
   */
  async getMonthlyExpenses(year?: number) {
    const targetYear = year || new Date().getFullYear();
    
    const expenses = await this.prisma.projProjectExpense.findMany({
      where: {
        expenseDate: {
          gte: new Date(`${targetYear}-01-01`),
          lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    });

    // تجميع المصروفات حسب الشهر
    const monthlyData: { [key: number]: number } = {};
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = 0;
    }

    for (const expense of expenses) {
      const month = expense.expenseDate.getMonth() + 1;
      monthlyData[month] += Number(expense.amount) || 0;
    }

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month: parseInt(month),
      amount,
    }));
  }

  /**
   * بيانات الرسم البياني - تقدم المشاريع
   */
  async getProjectsProgress() {
    const projects = await this.prisma.projProject.findMany({
      where: {
        status: {
          in: ['in_progress', 'approved'],
        },
      },
      select: {
        id: true,
        name: true,
        progressPercent: true,
        plannedEndDate: true,
        status: true,
      },
      orderBy: { progressPercent: 'desc' },
      take: 10,
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      progress: Number(p.progressPercent),
      plannedEndDate: p.plannedEndDate,
      status: p.status,
    }));
  }

  /**
   * بيانات الرسم البياني - توزيع الميزانية
   */
  async getBudgetDistribution() {
    const projects = await this.prisma.projProject.findMany({
      where: {
        status: {
          notIn: ['cancelled', 'draft'],
        },
      },
      select: {
        id: true,
        name: true,
        estimatedBudget: true,
        projectType: true,
      },
    });

    // تجميع حسب نوع المشروع
    const byType: { [key: string]: number } = {};
    for (const project of projects) {
      const type = project.projectType;
      byType[type] = (byType[type] || 0) + Number(project.estimatedBudget);
    }

    return Object.entries(byType).map(([type, amount]) => ({
      type,
      amount,
    }));
  }

  /**
   * المشاريع المتأخرة
   */
  async getDelayedProjects() {
    const today = new Date();
    
    return this.prisma.projProject.findMany({
      where: {
        status: 'in_progress',
        plannedEndDate: {
          lt: today,
        },
      },
      select: {
        id: true,
        projectNumber: true,
        name: true,
        plannedEndDate: true,
        progressPercent: true,
      },
      orderBy: { plannedEndDate: 'asc' },
    });
  }

  /**
   * المستخلصات المعلقة
   */
  async getPendingInvoices() {
    return this.prisma.projContractorInvoice.findMany({
      where: {
        status: {
          in: ['submitted', 'under_review'],
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        netAmount: true,
        status: true,
        contractor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }
}
