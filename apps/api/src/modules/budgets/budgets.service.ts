import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto, QueryBudgetsDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء ميزانية جديدة
   */
  async create(createBudgetDto: CreateBudgetDto) {
    // التحقق من وجود المشروع
    const project = await this.prisma.projProject.findUnique({
      where: { id: createBudgetDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${createBudgetDto.projectId}`);
    }

    // الحصول على آخر إصدار للميزانية
    const lastBudget = await this.prisma.projProjectBudget.findFirst({
      where: { projectId: createBudgetDto.projectId },
      orderBy: { budgetVersion: 'desc' },
    });

    const budgetVersion = createBudgetDto.budgetVersion || (lastBudget ? lastBudget.budgetVersion + 1 : 1);

    // التحقق من عدم تكرار إصدار الميزانية
    const existingBudget = await this.prisma.projProjectBudget.findUnique({
      where: {
        projectId_budgetVersion: {
          projectId: createBudgetDto.projectId,
          budgetVersion,
        },
      },
    });

    if (existingBudget) {
      throw new BadRequestException(
        `إصدار الميزانية ${budgetVersion} موجود مسبقاً في هذا المشروع`
      );
    }

    // حساب الميزانية المتبقية
    const remainingBudget = createBudgetDto.currentBudget - 
      (createBudgetDto.committedAmount || 0) - 
      (createBudgetDto.spentAmount || 0);

    // إنشاء الميزانية
    const budget = await this.prisma.projProjectBudget.create({
      data: {
        projectId: createBudgetDto.projectId,
        budgetVersion,
        originalBudget: new Prisma.Decimal(createBudgetDto.originalBudget),
        adjustments: new Prisma.Decimal(createBudgetDto.adjustments || 0),
        currentBudget: new Prisma.Decimal(createBudgetDto.currentBudget),
        committedAmount: new Prisma.Decimal(createBudgetDto.committedAmount || 0),
        spentAmount: new Prisma.Decimal(createBudgetDto.spentAmount || 0),
        remainingBudget: new Prisma.Decimal(remainingBudget),
        commitmentPercent: createBudgetDto.currentBudget > 0 
          ? new Prisma.Decimal(((createBudgetDto.committedAmount || 0) / createBudgetDto.currentBudget) * 100)
          : new Prisma.Decimal(0),
        spentPercent: createBudgetDto.currentBudget > 0
          ? new Prisma.Decimal(((createBudgetDto.spentAmount || 0) / createBudgetDto.currentBudget) * 100)
          : new Prisma.Decimal(0),
        status: createBudgetDto.status || 'draft',
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
      },
    });

    return budget;
  }

  /**
   * الحصول على قائمة الميزانيات
   */
  async findAll(query: QueryBudgetsDto) {
    const {
      projectId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'budgetVersion',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProjProjectBudgetWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const [budgets, total] = await Promise.all([
      this.prisma.projProjectBudget.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projProjectBudget.count({ where }),
    ]);

    return {
      data: budgets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على ميزانية بالمعرف
   */
  async findOne(id: string) {
    const budget = await this.prisma.projProjectBudget.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
            estimatedBudget: true,
            approvedBudget: true,
          },
        },
        allocations: true,
      },
    });

    if (!budget) {
      throw new NotFoundException(`الميزانية غير موجودة: ${id}`);
    }

    return budget;
  }

  /**
   * تحديث ميزانية
   */
  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    // التحقق من وجود الميزانية
    const existingBudget = await this.prisma.projProjectBudget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      throw new NotFoundException(`الميزانية غير موجودة: ${id}`);
    }

    // تحديث الميزانية
    const updateData: Prisma.ProjProjectBudgetUpdateInput = {};

    if (updateBudgetDto.originalBudget !== undefined) {
      updateData.originalBudget = new Prisma.Decimal(updateBudgetDto.originalBudget);
    }
    if (updateBudgetDto.adjustments !== undefined) {
      updateData.adjustments = new Prisma.Decimal(updateBudgetDto.adjustments);
    }
    if (updateBudgetDto.currentBudget !== undefined) {
      updateData.currentBudget = new Prisma.Decimal(updateBudgetDto.currentBudget);
    }
    if (updateBudgetDto.committedAmount !== undefined) {
      updateData.committedAmount = new Prisma.Decimal(updateBudgetDto.committedAmount);
    }
    if (updateBudgetDto.spentAmount !== undefined) {
      updateData.spentAmount = new Prisma.Decimal(updateBudgetDto.spentAmount);
    }
    if (updateBudgetDto.commitmentPercent !== undefined) {
      updateData.commitmentPercent = new Prisma.Decimal(updateBudgetDto.commitmentPercent);
    }
    if (updateBudgetDto.spentPercent !== undefined) {
      updateData.spentPercent = new Prisma.Decimal(updateBudgetDto.spentPercent);
    }
    if (updateBudgetDto.status !== undefined) {
      updateData.status = updateBudgetDto.status;
    }

    // حساب الميزانية المتبقية
    const currentBudget = updateBudgetDto.currentBudget !== undefined 
      ? updateBudgetDto.currentBudget 
      : Number(existingBudget.currentBudget);
    const committedAmount = updateBudgetDto.committedAmount !== undefined 
      ? updateBudgetDto.committedAmount 
      : Number(existingBudget.committedAmount);
    const spentAmount = updateBudgetDto.spentAmount !== undefined 
      ? updateBudgetDto.spentAmount 
      : Number(existingBudget.spentAmount);

    updateData.remainingBudget = new Prisma.Decimal(currentBudget - committedAmount - spentAmount);

    // تحديث النسب إذا لم يتم تحديدها
    if (updateBudgetDto.commitmentPercent === undefined && currentBudget > 0) {
      updateData.commitmentPercent = new Prisma.Decimal((committedAmount / currentBudget) * 100);
    }
    if (updateBudgetDto.spentPercent === undefined && currentBudget > 0) {
      updateData.spentPercent = new Prisma.Decimal((spentAmount / currentBudget) * 100);
    }

    const budget = await this.prisma.projProjectBudget.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
      },
    });

    return budget;
  }

  /**
   * حذف ميزانية
   */
  async remove(id: string) {
    const budget = await this.prisma.projProjectBudget.findUnique({
      where: { id },
      include: {
        allocations: true,
      },
    });

    if (!budget) {
      throw new NotFoundException(`الميزانية غير موجودة: ${id}`);
    }

    // التحقق من عدم وجود توزيعات مرتبطة
    if (budget.allocations.length > 0) {
      throw new BadRequestException(
        `لا يمكن حذف الميزانية لأن هناك ${budget.allocations.length} توزيعات مرتبطة بها`
      );
    }

    await this.prisma.projProjectBudget.delete({
      where: { id },
    });

    return { message: 'تم حذف الميزانية بنجاح' };
  }

  /**
   * الحصول على ميزانيات مشروع معين
   */
  async findByProject(projectId: string) {
    const project = await this.prisma.projProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${projectId}`);
    }

    const budgets = await this.prisma.projProjectBudget.findMany({
      where: { projectId },
      include: {
        allocations: true,
      },
      orderBy: { budgetVersion: 'desc' },
    });

    // حساب الإحصائيات
    const latestBudget = budgets[0];
    const statistics = {
      totalVersions: budgets.length,
      currentBudget: latestBudget ? Number(latestBudget.currentBudget) : 0,
      totalSpent: latestBudget ? Number(latestBudget.spentAmount) : 0,
      totalCommitted: latestBudget ? Number(latestBudget.committedAmount) : 0,
      remainingBudget: latestBudget ? Number(latestBudget.remainingBudget) : 0,
      spentPercent: latestBudget ? Number(latestBudget.spentPercent) : 0,
      commitmentPercent: latestBudget ? Number(latestBudget.commitmentPercent) : 0,
    };

    return {
      budgets,
      statistics,
    };
  }

  /**
   * إحصائيات الميزانيات
   */
  async getStatistics(projectId?: string) {
    const where: Prisma.ProjProjectBudgetWhereInput = projectId ? { projectId } : {};

    const [total, byStatus, amountStats] = await Promise.all([
      this.prisma.projProjectBudget.count({ where }),
      this.prisma.projProjectBudget.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.projProjectBudget.aggregate({
        where,
        _sum: {
          currentBudget: true,
          spentAmount: true,
          committedAmount: true,
          remainingBudget: true,
        },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalCurrent = amountStats._sum.currentBudget
      ? Number(amountStats._sum.currentBudget)
      : 0;
    const totalSpent = amountStats._sum.spentAmount
      ? Number(amountStats._sum.spentAmount)
      : 0;
    const totalCommitted = amountStats._sum.committedAmount
      ? Number(amountStats._sum.committedAmount)
      : 0;
    const totalRemaining = amountStats._sum.remainingBudget
      ? Number(amountStats._sum.remainingBudget)
      : 0;

    return {
      total,
      byStatus: {
        draft: statusCounts['draft'] || 0,
        pending_approval: statusCounts['pending_approval'] || 0,
        active: statusCounts['active'] || 0,
        closed: statusCounts['closed'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
      },
      amounts: {
        totalCurrent,
        totalSpent,
        totalCommitted,
        totalRemaining,
        utilizationPercent:
          totalCurrent > 0 ? ((totalSpent + totalCommitted) / totalCurrent) * 100 : 0,
      },
    };
  }
}
