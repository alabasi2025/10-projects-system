import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, QueryExpensesDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء مصروف جديد
   * القاعدة الصارمة: كل مصروف يتم تسجيله يجب أن يُنشئ قيد محاسبي
   */
  async create(createExpenseDto: CreateExpenseDto) {
    // التحقق من وجود المشروع
    const project = await this.prisma.projProject.findUnique({
      where: { id: createExpenseDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${createExpenseDto.projectId}`);
    }

    // التحقق من وجود المرحلة إذا تم تحديدها
    if (createExpenseDto.phaseId) {
      const phase = await this.prisma.projProjectPhase.findUnique({
        where: { id: createExpenseDto.phaseId },
      });

      if (!phase) {
        throw new NotFoundException(`المرحلة غير موجودة: ${createExpenseDto.phaseId}`);
      }

      if (phase.projectId !== createExpenseDto.projectId) {
        throw new BadRequestException('المرحلة لا تنتمي للمشروع المحدد');
      }
    }

    // التحقق من وجود حزمة العمل إذا تم تحديدها
    if (createExpenseDto.workPackageId) {
      const workPackage = await this.prisma.projWorkPackage.findUnique({
        where: { id: createExpenseDto.workPackageId },
      });

      if (!workPackage) {
        throw new NotFoundException(`حزمة العمل غير موجودة: ${createExpenseDto.workPackageId}`);
      }

      if (workPackage.projectId !== createExpenseDto.projectId) {
        throw new BadRequestException('حزمة العمل لا تنتمي للمشروع المحدد');
      }
    }

    // إنشاء قيد محاسبي (محاكاة - سيتم ربطه بالنظام الأم لاحقاً)
    // ملاحظة: journalEntryId يجب أن يكون UUID صالح أو null
    // في الواقع سيتم استدعاء API النظام الأم وإرجاع UUID حقيقي
    if (createExpenseDto.createJournalEntry !== false) {
      const journalEntry = await this.createJournalEntry(createExpenseDto);
      this.logger.log(`تم إنشاء قيد محاسبي للمصروف: ${journalEntry.entryNumber}`);
    }

    // إنشاء المصروف
    const expense = await this.prisma.projProjectExpense.create({
      data: {
        projectId: createExpenseDto.projectId,
        phaseId: createExpenseDto.phaseId,
        workPackageId: createExpenseDto.workPackageId,
        expenseType: createExpenseDto.expenseType,
        description: createExpenseDto.description,
        amount: new Prisma.Decimal(createExpenseDto.amount),
        referenceType: createExpenseDto.referenceType,
        referenceId: createExpenseDto.referenceId,
        expenseDate: new Date(createExpenseDto.expenseDate),
        // journalEntryId سيتم تحديثه لاحقاً عند ربط النظام الأم
        createdBy: createExpenseDto.createdBy,
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        workPackage: {
          select: {
            id: true,
            packageNumber: true,
            name: true,
          },
        },
      },
    });

    // تحديث المبلغ المصروف في المرحلة
    if (createExpenseDto.phaseId) {
      await this.updatePhaseSpentAmount(createExpenseDto.phaseId);
    }

    // تحديث التكلفة الفعلية في حزمة العمل
    if (createExpenseDto.workPackageId) {
      await this.updateWorkPackageActualCost(createExpenseDto.workPackageId);
    }

    // تحديث المصروفات في ميزانية المشروع
    await this.updateProjectBudgetSpent(createExpenseDto.projectId);

    return expense;
  }

  /**
   * إنشاء قيد محاسبي للمصروف
   * القاعدة الصارمة: كل مصروف يجب أن يُنشئ قيد محاسبي
   */
  private async createJournalEntry(expense: CreateExpenseDto) {
    // هذه محاكاة لإنشاء قيد محاسبي
    // في الواقع سيتم استدعاء API النظام الأم
    const entryNumber = `JE-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    const journalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber,
      date: expense.expenseDate,
      description: `مصروف مشروع: ${expense.description || expense.expenseType}`,
      debitAccount: '5101', // حساب مصروفات المشاريع
      creditAccount: '1101', // حساب النقدية أو الدائنين
      amount: expense.amount,
      reference: expense.referenceId,
      projectId: expense.projectId,
      status: 'posted',
      createdAt: new Date(),
    };

    this.logger.log(`قيد محاسبي: ${JSON.stringify(journalEntry)}`);

    return journalEntry;
  }

  /**
   * الحصول على قائمة المصروفات
   */
  async findAll(query: QueryExpensesDto) {
    const {
      projectId,
      phaseId,
      workPackageId,
      expenseType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'expenseDate',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProjProjectExpenseWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (phaseId) {
      where.phaseId = phaseId;
    }

    if (workPackageId) {
      where.workPackageId = workPackageId;
    }

    if (expenseType) {
      where.expenseType = expenseType;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expenseDate.lte = new Date(endDate);
      }
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const [expenses, total] = await Promise.all([
      this.prisma.projProjectExpense.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              name: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseNumber: true,
              name: true,
            },
          },
          workPackage: {
            select: {
              id: true,
              packageNumber: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projProjectExpense.count({ where }),
    ]);

    return {
      data: expenses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على مصروف بالمعرف
   */
  async findOne(id: string) {
    const expense = await this.prisma.projProjectExpense.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
          },
        },
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        workPackage: {
          select: {
            id: true,
            packageNumber: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`المصروف غير موجود: ${id}`);
    }

    return expense;
  }

  /**
   * تحديث مصروف
   */
  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    // التحقق من وجود المصروف
    const existingExpense = await this.prisma.projProjectExpense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`المصروف غير موجود: ${id}`);
    }

    // تحديث المصروف
    const updateData: Prisma.ProjProjectExpenseUpdateInput = {};

    if (updateExpenseDto.phaseId !== undefined) {
      updateData.phase = updateExpenseDto.phaseId
        ? { connect: { id: updateExpenseDto.phaseId } }
        : { disconnect: true };
    }
    if (updateExpenseDto.workPackageId !== undefined) {
      updateData.workPackage = updateExpenseDto.workPackageId
        ? { connect: { id: updateExpenseDto.workPackageId } }
        : { disconnect: true };
    }
    if (updateExpenseDto.expenseType !== undefined) {
      updateData.expenseType = updateExpenseDto.expenseType;
    }
    if (updateExpenseDto.description !== undefined) {
      updateData.description = updateExpenseDto.description;
    }
    if (updateExpenseDto.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(updateExpenseDto.amount);
    }
    if (updateExpenseDto.referenceType !== undefined) {
      updateData.referenceType = updateExpenseDto.referenceType;
    }
    if (updateExpenseDto.referenceId !== undefined) {
      updateData.referenceId = updateExpenseDto.referenceId;
    }
    if (updateExpenseDto.expenseDate !== undefined) {
      updateData.expenseDate = new Date(updateExpenseDto.expenseDate);
    }
    if (updateExpenseDto.journalEntryId !== undefined) {
      updateData.journalEntryId = updateExpenseDto.journalEntryId;
    }

    const expense = await this.prisma.projProjectExpense.update({
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
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        workPackage: {
          select: {
            id: true,
            packageNumber: true,
            name: true,
          },
        },
      },
    });

    // تحديث المبالغ المصروفة
    if (existingExpense.phaseId) {
      await this.updatePhaseSpentAmount(existingExpense.phaseId);
    }
    if (expense.phaseId && expense.phaseId !== existingExpense.phaseId) {
      await this.updatePhaseSpentAmount(expense.phaseId);
    }

    if (existingExpense.workPackageId) {
      await this.updateWorkPackageActualCost(existingExpense.workPackageId);
    }
    if (expense.workPackageId && expense.workPackageId !== existingExpense.workPackageId) {
      await this.updateWorkPackageActualCost(expense.workPackageId);
    }

    // تحديث ميزانية المشروع
    await this.updateProjectBudgetSpent(existingExpense.projectId);

    return expense;
  }

  /**
   * حذف مصروف
   */
  async remove(id: string) {
    const expense = await this.prisma.projProjectExpense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`المصروف غير موجود: ${id}`);
    }

    const { projectId, phaseId, workPackageId } = expense;

    await this.prisma.projProjectExpense.delete({
      where: { id },
    });

    // تحديث المبالغ المصروفة
    if (phaseId) {
      await this.updatePhaseSpentAmount(phaseId);
    }
    if (workPackageId) {
      await this.updateWorkPackageActualCost(workPackageId);
    }

    // تحديث ميزانية المشروع
    await this.updateProjectBudgetSpent(projectId);

    return { message: 'تم حذف المصروف بنجاح' };
  }

  /**
   * تحديث المبلغ المصروف في المرحلة
   */
  private async updatePhaseSpentAmount(phaseId: string) {
    const result = await this.prisma.projProjectExpense.aggregate({
      where: { phaseId },
      _sum: { amount: true },
    });

    await this.prisma.projProjectPhase.update({
      where: { id: phaseId },
      data: {
        spentAmount: result._sum.amount || new Prisma.Decimal(0),
      },
    });
  }

  /**
   * تحديث التكلفة الفعلية في حزمة العمل
   */
  private async updateWorkPackageActualCost(workPackageId: string) {
    const result = await this.prisma.projProjectExpense.aggregate({
      where: { workPackageId },
      _sum: { amount: true },
    });

    await this.prisma.projWorkPackage.update({
      where: { id: workPackageId },
      data: {
        actualCost: result._sum.amount || new Prisma.Decimal(0),
      },
    });
  }

  /**
   * تحديث المصروفات في ميزانية المشروع
   */
  private async updateProjectBudgetSpent(projectId: string) {
    const result = await this.prisma.projProjectExpense.aggregate({
      where: { projectId },
      _sum: { amount: true },
    });

    const totalSpent = result._sum.amount ? Number(result._sum.amount) : 0;

    // تحديث آخر إصدار من الميزانية
    const latestBudget = await this.prisma.projProjectBudget.findFirst({
      where: { projectId },
      orderBy: { budgetVersion: 'desc' },
    });

    if (latestBudget) {
      const currentBudget = Number(latestBudget.currentBudget);
      const committedAmount = Number(latestBudget.committedAmount);

      await this.prisma.projProjectBudget.update({
        where: { id: latestBudget.id },
        data: {
          spentAmount: new Prisma.Decimal(totalSpent),
          remainingBudget: new Prisma.Decimal(currentBudget - committedAmount - totalSpent),
          spentPercent: currentBudget > 0 
            ? new Prisma.Decimal((totalSpent / currentBudget) * 100)
            : new Prisma.Decimal(0),
        },
      });
    }
  }

  /**
   * إحصائيات المصروفات
   */
  async getStatistics(projectId?: string) {
    const where: Prisma.ProjProjectExpenseWhereInput = projectId ? { projectId } : {};

    const [total, byType, amountStats] = await Promise.all([
      this.prisma.projProjectExpense.count({ where }),
      this.prisma.projProjectExpense.groupBy({
        by: ['expenseType'],
        where,
        _count: { expenseType: true },
        _sum: { amount: true },
      }),
      this.prisma.projProjectExpense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const typeStats = byType.reduce(
      (acc, item) => {
        acc[item.expenseType] = {
          count: item._count.expenseType,
          amount: item._sum.amount ? Number(item._sum.amount) : 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>
    );

    return {
      total,
      totalAmount: amountStats._sum.amount ? Number(amountStats._sum.amount) : 0,
      byType: typeStats,
    };
  }
}
