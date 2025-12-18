import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * إنشاء مشروع جديد
   */
  async create(createProjectDto: CreateProjectDto, userId?: string) {
    // التحقق من عدم تكرار رقم المشروع
    const existingProject = await this.prisma.projProject.findUnique({
      where: { projectNumber: createProjectDto.projectNumber },
    });

    if (existingProject) {
      throw new ConflictException(
        `رقم المشروع "${createProjectDto.projectNumber}" موجود مسبقاً`
      );
    }

    // التحقق من صحة التواريخ
    const plannedStartDate = new Date(createProjectDto.plannedStartDate);
    const plannedEndDate = new Date(createProjectDto.plannedEndDate);

    if (plannedEndDate <= plannedStartDate) {
      throw new BadRequestException(
        'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
      );
    }

    // حساب المدة بالأيام إذا لم تُحدد
    const durationDays =
      createProjectDto.durationDays ||
      Math.ceil(
        (plannedEndDate.getTime() - plannedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    const project = await this.prisma.projProject.create({
      data: {
        projectNumber: createProjectDto.projectNumber,
        name: createProjectDto.name,
        description: createProjectDto.description,
        projectType: createProjectDto.projectType,
        objectives: createProjectDto.objectives,
        scope: createProjectDto.scope,
        deliverables: createProjectDto.deliverables,
        estimatedBudget: new Prisma.Decimal(createProjectDto.estimatedBudget),
        approvedBudget: createProjectDto.approvedBudget
          ? new Prisma.Decimal(createProjectDto.approvedBudget)
          : null,
        currency: createProjectDto.currency || 'SAR',
        plannedStartDate,
        plannedEndDate,
        actualStartDate: createProjectDto.actualStartDate
          ? new Date(createProjectDto.actualStartDate)
          : null,
        actualEndDate: createProjectDto.actualEndDate
          ? new Date(createProjectDto.actualEndDate)
          : null,
        durationDays,
        status: createProjectDto.status || 'draft',
        progressPercent: new Prisma.Decimal(
          createProjectDto.progressPercent || 0
        ),
        projectManagerId: createProjectDto.projectManagerId,
        sponsorId: createProjectDto.sponsorId,
        attachments: createProjectDto.attachments || [],
        createdBy: userId,
      },
      include: {
        phases: true,
        budgets: true,
      },
    });

    return {
      success: true,
      message: 'تم إنشاء المشروع بنجاح',
      data: this.formatProject(project),
    };
  }

  /**
   * الحصول على قائمة المشاريع مع الفلترة والترقيم
   */
  async findAll(query: QueryProjectsDto) {
    const {
      search,
      status,
      projectType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // بناء شروط البحث
    const where: Prisma.ProjProjectWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { projectNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (projectType) {
      where.projectType = projectType;
    }

    // حساب الإجمالي
    const total = await this.prisma.projProject.count({ where });

    // جلب المشاريع
    const projects = await this.prisma.projProject.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
    });

    return {
      success: true,
      data: projects.map((p) => this.formatProject(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * الحصول على مشروع واحد بالمعرف
   */
  async findOne(id: string) {
    const project = await this.prisma.projProject.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            workPackages: {
              orderBy: { packageNumber: 'asc' },
            },
          },
        },
        budgets: {
          orderBy: { budgetVersion: 'desc' },
          take: 1,
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 10,
        },
        milestones: {
          orderBy: { plannedDate: 'asc' },
        },
        teamMembers: true,
        _count: {
          select: {
            phases: true,
            workPackages: true,
            expenses: true,
            milestones: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`المشروع بالمعرف "${id}" غير موجود`);
    }

    return {
      success: true,
      data: this.formatProject(project),
    };
  }

  /**
   * تحديث مشروع
   */
  async update(id: string, updateProjectDto: UpdateProjectDto, userId?: string) {
    // التحقق من وجود المشروع
    const existingProject = await this.prisma.projProject.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`المشروع بالمعرف "${id}" غير موجود`);
    }

    // التحقق من عدم تكرار رقم المشروع إذا تم تغييره
    if (
      updateProjectDto.projectNumber &&
      updateProjectDto.projectNumber !== existingProject.projectNumber
    ) {
      const duplicateProject = await this.prisma.projProject.findUnique({
        where: { projectNumber: updateProjectDto.projectNumber },
      });

      if (duplicateProject) {
        throw new ConflictException(
          `رقم المشروع "${updateProjectDto.projectNumber}" موجود مسبقاً`
        );
      }
    }

    // التحقق من صحة التواريخ إذا تم تغييرها
    if (updateProjectDto.plannedStartDate || updateProjectDto.plannedEndDate) {
      const plannedStartDate = updateProjectDto.plannedStartDate
        ? new Date(updateProjectDto.plannedStartDate)
        : existingProject.plannedStartDate;
      const plannedEndDate = updateProjectDto.plannedEndDate
        ? new Date(updateProjectDto.plannedEndDate)
        : existingProject.plannedEndDate;

      if (plannedEndDate <= plannedStartDate) {
        throw new BadRequestException(
          'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
        );
      }
    }

    // بناء بيانات التحديث
    const updateData: Prisma.ProjProjectUpdateInput = {};

    if (updateProjectDto.projectNumber !== undefined) {
      updateData.projectNumber = updateProjectDto.projectNumber;
    }
    if (updateProjectDto.name !== undefined) {
      updateData.name = updateProjectDto.name;
    }
    if (updateProjectDto.description !== undefined) {
      updateData.description = updateProjectDto.description;
    }
    if (updateProjectDto.projectType !== undefined) {
      updateData.projectType = updateProjectDto.projectType;
    }
    if (updateProjectDto.objectives !== undefined) {
      updateData.objectives = updateProjectDto.objectives;
    }
    if (updateProjectDto.scope !== undefined) {
      updateData.scope = updateProjectDto.scope;
    }
    if (updateProjectDto.deliverables !== undefined) {
      updateData.deliverables = updateProjectDto.deliverables;
    }
    if (updateProjectDto.estimatedBudget !== undefined) {
      updateData.estimatedBudget = new Prisma.Decimal(
        updateProjectDto.estimatedBudget
      );
    }
    if (updateProjectDto.approvedBudget !== undefined) {
      updateData.approvedBudget = new Prisma.Decimal(
        updateProjectDto.approvedBudget
      );
    }
    if (updateProjectDto.currency !== undefined) {
      updateData.currency = updateProjectDto.currency;
    }
    if (updateProjectDto.plannedStartDate !== undefined) {
      updateData.plannedStartDate = new Date(updateProjectDto.plannedStartDate);
    }
    if (updateProjectDto.plannedEndDate !== undefined) {
      updateData.plannedEndDate = new Date(updateProjectDto.plannedEndDate);
    }
    if (updateProjectDto.actualStartDate !== undefined) {
      updateData.actualStartDate = new Date(updateProjectDto.actualStartDate);
    }
    if (updateProjectDto.actualEndDate !== undefined) {
      updateData.actualEndDate = new Date(updateProjectDto.actualEndDate);
    }
    if (updateProjectDto.durationDays !== undefined) {
      updateData.durationDays = updateProjectDto.durationDays;
    }
    if (updateProjectDto.status !== undefined) {
      updateData.status = updateProjectDto.status;
    }
    if (updateProjectDto.progressPercent !== undefined) {
      updateData.progressPercent = new Prisma.Decimal(
        updateProjectDto.progressPercent
      );
    }
    if (updateProjectDto.projectManagerId !== undefined) {
      updateData.projectManagerId = updateProjectDto.projectManagerId;
    }
    if (updateProjectDto.sponsorId !== undefined) {
      updateData.sponsorId = updateProjectDto.sponsorId;
    }
    if (updateProjectDto.attachments !== undefined) {
      updateData.attachments = updateProjectDto.attachments;
    }

    const project = await this.prisma.projProject.update({
      where: { id },
      data: updateData,
      include: {
        phases: true,
        budgets: true,
      },
    });

    return {
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      data: this.formatProject(project),
    };
  }

  /**
   * حذف مشروع
   */
  async remove(id: string) {
    // التحقق من وجود المشروع
    const existingProject = await this.prisma.projProject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            phases: true,
            workPackages: true,
            expenses: true,
          },
        },
      },
    });

    if (!existingProject) {
      throw new NotFoundException(`المشروع بالمعرف "${id}" غير موجود`);
    }

    // التحقق من عدم وجود بيانات مرتبطة (اختياري - يمكن تفعيل Cascade Delete)
    if (
      existingProject._count.phases > 0 ||
      existingProject._count.workPackages > 0 ||
      existingProject._count.expenses > 0
    ) {
      // يمكن إما رفض الحذف أو حذف كل شيء (Cascade)
      // هنا نستخدم Cascade Delete المُعرّف في Schema
    }

    await this.prisma.projProject.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'تم حذف المشروع بنجاح',
      data: { id },
    };
  }

  /**
   * الحصول على إحصائيات المشاريع
   */
  async getStatistics() {
    const [
      totalProjects,
      draftProjects,
      inProgressProjects,
      completedProjects,
      totalBudget,
      totalSpent,
    ] = await Promise.all([
      this.prisma.projProject.count(),
      this.prisma.projProject.count({ where: { status: 'draft' } }),
      this.prisma.projProject.count({ where: { status: 'in_progress' } }),
      this.prisma.projProject.count({ where: { status: 'completed' } }),
      this.prisma.projProject.aggregate({
        _sum: { estimatedBudget: true },
      }),
      this.prisma.projProjectExpense.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalProjects,
        byStatus: {
          draft: draftProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
        },
        financial: {
          totalBudget: totalBudget._sum.estimatedBudget?.toNumber() || 0,
          totalSpent: totalSpent._sum.amount?.toNumber() || 0,
        },
      },
    };
  }

  /**
   * تنسيق بيانات المشروع للإرجاع
   */
  private formatProject(project: any) {
    return {
      ...project,
      estimatedBudget: project.estimatedBudget?.toNumber(),
      approvedBudget: project.approvedBudget?.toNumber(),
      progressPercent: project.progressPercent?.toNumber(),
      phases: project.phases?.map((phase: any) => ({
        ...phase,
        allocatedBudget: phase.allocatedBudget?.toNumber(),
        spentAmount: phase.spentAmount?.toNumber(),
        progressPercent: phase.progressPercent?.toNumber(),
        workPackages: phase.workPackages?.map((wp: any) => ({
          ...wp,
          estimatedCost: wp.estimatedCost?.toNumber(),
          contractedAmount: wp.contractedAmount?.toNumber(),
          actualCost: wp.actualCost?.toNumber(),
          progressPercent: wp.progressPercent?.toNumber(),
        })),
      })),
      budgets: project.budgets?.map((budget: any) => ({
        ...budget,
        originalBudget: budget.originalBudget?.toNumber(),
        adjustments: budget.adjustments?.toNumber(),
        currentBudget: budget.currentBudget?.toNumber(),
        committedAmount: budget.committedAmount?.toNumber(),
        spentAmount: budget.spentAmount?.toNumber(),
        remainingBudget: budget.remainingBudget?.toNumber(),
        commitmentPercent: budget.commitmentPercent?.toNumber(),
        spentPercent: budget.spentPercent?.toNumber(),
      })),
      expenses: project.expenses?.map((expense: any) => ({
        ...expense,
        amount: expense.amount?.toNumber(),
      })),
    };
  }
}
