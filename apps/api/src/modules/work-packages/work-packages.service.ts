import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkPackageDto, UpdateWorkPackageDto, QueryWorkPackagesDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkPackagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء حزمة عمل جديدة
   */
  async create(createWorkPackageDto: CreateWorkPackageDto) {
    // التحقق من وجود المرحلة
    const phase = await this.prisma.projProjectPhase.findUnique({
      where: { id: createWorkPackageDto.phaseId },
    });

    if (!phase) {
      throw new NotFoundException(`المرحلة غير موجودة: ${createWorkPackageDto.phaseId}`);
    }

    // التحقق من وجود المشروع
    const project = await this.prisma.projProject.findUnique({
      where: { id: createWorkPackageDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${createWorkPackageDto.projectId}`);
    }

    // التحقق من أن المرحلة تنتمي للمشروع
    if (phase.projectId !== createWorkPackageDto.projectId) {
      throw new BadRequestException('المرحلة لا تنتمي للمشروع المحدد');
    }

    // التحقق من عدم تكرار رقم حزمة العمل
    const existingPackage = await this.prisma.projWorkPackage.findFirst({
      where: {
        projectId: createWorkPackageDto.projectId,
        packageNumber: createWorkPackageDto.packageNumber,
      },
    });

    if (existingPackage) {
      throw new BadRequestException(
        `رقم حزمة العمل ${createWorkPackageDto.packageNumber} موجود مسبقاً في هذا المشروع`
      );
    }

    // إنشاء حزمة العمل
    const workPackage = await this.prisma.projWorkPackage.create({
      data: {
        phaseId: createWorkPackageDto.phaseId,
        projectId: createWorkPackageDto.projectId,
        packageNumber: createWorkPackageDto.packageNumber,
        name: createWorkPackageDto.name,
        description: createWorkPackageDto.description,
        scopeOfWork: createWorkPackageDto.scopeOfWork,
        deliverables: createWorkPackageDto.deliverables,
        acceptanceCriteria: createWorkPackageDto.acceptanceCriteria,
        estimatedCost: createWorkPackageDto.estimatedCost
          ? new Prisma.Decimal(createWorkPackageDto.estimatedCost)
          : null,
        contractedAmount: createWorkPackageDto.contractedAmount
          ? new Prisma.Decimal(createWorkPackageDto.contractedAmount)
          : null,
        plannedStartDate: createWorkPackageDto.plannedStartDate
          ? new Date(createWorkPackageDto.plannedStartDate)
          : null,
        plannedEndDate: createWorkPackageDto.plannedEndDate
          ? new Date(createWorkPackageDto.plannedEndDate)
          : null,
        actualStartDate: createWorkPackageDto.actualStartDate
          ? new Date(createWorkPackageDto.actualStartDate)
          : null,
        actualEndDate: createWorkPackageDto.actualEndDate
          ? new Date(createWorkPackageDto.actualEndDate)
          : null,
        durationDays: createWorkPackageDto.durationDays,
        status: createWorkPackageDto.status || 'draft',
        progressPercent: createWorkPackageDto.progressPercent
          ? new Prisma.Decimal(createWorkPackageDto.progressPercent)
          : new Prisma.Decimal(0),
        contractorId: createWorkPackageDto.contractorId,
        contractId: createWorkPackageDto.contractId,
        supervisorId: createWorkPackageDto.supervisorId,
      },
      include: {
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
      },
    });

    // تحديث نسبة تقدم المرحلة
    await this.updatePhaseProgress(createWorkPackageDto.phaseId);

    return workPackage;
  }

  /**
   * الحصول على قائمة حزم العمل
   */
  async findAll(query: QueryWorkPackagesDto) {
    const {
      projectId,
      phaseId,
      status,
      contractorId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'packageNumber',
      sortOrder = 'asc',
    } = query;

    const where: Prisma.ProjWorkPackageWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (phaseId) {
      where.phaseId = phaseId;
    }

    if (status) {
      where.status = status;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { packageNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [workPackages, total] = await Promise.all([
      this.prisma.projWorkPackage.findMany({
        where,
        include: {
          phase: {
            select: {
              id: true,
              phaseNumber: true,
              name: true,
            },
          },
          project: {
            select: {
              id: true,
              projectNumber: true,
              name: true,
            },
          },
          _count: {
            select: {
              materials: true,
              expenses: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projWorkPackage.count({ where }),
    ]);

    return {
      data: workPackages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على حزمة عمل بالمعرف
   */
  async findOne(id: string) {
    const workPackage = await this.prisma.projWorkPackage.findUnique({
      where: { id },
      include: {
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
            status: true,
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
          },
        },
        materials: {
          orderBy: { createdAt: 'desc' },
        },
        expenses: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!workPackage) {
      throw new NotFoundException(`حزمة العمل غير موجودة: ${id}`);
    }

    return workPackage;
  }

  /**
   * تحديث حزمة عمل
   */
  async update(id: string, updateWorkPackageDto: UpdateWorkPackageDto) {
    // التحقق من وجود حزمة العمل
    const existingPackage = await this.prisma.projWorkPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new NotFoundException(`حزمة العمل غير موجودة: ${id}`);
    }

    // التحقق من عدم تكرار رقم حزمة العمل
    if (
      updateWorkPackageDto.packageNumber &&
      updateWorkPackageDto.packageNumber !== existingPackage.packageNumber
    ) {
      const duplicatePackage = await this.prisma.projWorkPackage.findFirst({
        where: {
          projectId: existingPackage.projectId,
          packageNumber: updateWorkPackageDto.packageNumber,
          id: { not: id },
        },
      });

      if (duplicatePackage) {
        throw new BadRequestException(
          `رقم حزمة العمل ${updateWorkPackageDto.packageNumber} موجود مسبقاً في هذا المشروع`
        );
      }
    }

    // تحديث حزمة العمل
    const updateData: Prisma.ProjWorkPackageUpdateInput = {};

    if (updateWorkPackageDto.packageNumber !== undefined) {
      updateData.packageNumber = updateWorkPackageDto.packageNumber;
    }
    if (updateWorkPackageDto.name !== undefined) {
      updateData.name = updateWorkPackageDto.name;
    }
    if (updateWorkPackageDto.description !== undefined) {
      updateData.description = updateWorkPackageDto.description;
    }
    if (updateWorkPackageDto.scopeOfWork !== undefined) {
      updateData.scopeOfWork = updateWorkPackageDto.scopeOfWork;
    }
    if (updateWorkPackageDto.deliverables !== undefined) {
      updateData.deliverables = updateWorkPackageDto.deliverables;
    }
    if (updateWorkPackageDto.acceptanceCriteria !== undefined) {
      updateData.acceptanceCriteria = updateWorkPackageDto.acceptanceCriteria;
    }
    if (updateWorkPackageDto.estimatedCost !== undefined) {
      updateData.estimatedCost = new Prisma.Decimal(updateWorkPackageDto.estimatedCost);
    }
    if (updateWorkPackageDto.contractedAmount !== undefined) {
      updateData.contractedAmount = new Prisma.Decimal(updateWorkPackageDto.contractedAmount);
    }
    if (updateWorkPackageDto.actualCost !== undefined) {
      updateData.actualCost = new Prisma.Decimal(updateWorkPackageDto.actualCost);
    }
    if (updateWorkPackageDto.plannedStartDate !== undefined) {
      updateData.plannedStartDate = new Date(updateWorkPackageDto.plannedStartDate);
    }
    if (updateWorkPackageDto.plannedEndDate !== undefined) {
      updateData.plannedEndDate = new Date(updateWorkPackageDto.plannedEndDate);
    }
    if (updateWorkPackageDto.actualStartDate !== undefined) {
      updateData.actualStartDate = new Date(updateWorkPackageDto.actualStartDate);
    }
    if (updateWorkPackageDto.actualEndDate !== undefined) {
      updateData.actualEndDate = new Date(updateWorkPackageDto.actualEndDate);
    }
    if (updateWorkPackageDto.durationDays !== undefined) {
      updateData.durationDays = updateWorkPackageDto.durationDays;
    }
    if (updateWorkPackageDto.status !== undefined) {
      updateData.status = updateWorkPackageDto.status;
    }
    if (updateWorkPackageDto.progressPercent !== undefined) {
      updateData.progressPercent = new Prisma.Decimal(updateWorkPackageDto.progressPercent);
    }
    if (updateWorkPackageDto.contractorId !== undefined) {
      updateData.contractorId = updateWorkPackageDto.contractorId;
    }
    if (updateWorkPackageDto.contractId !== undefined) {
      updateData.contractId = updateWorkPackageDto.contractId;
    }
    if (updateWorkPackageDto.supervisorId !== undefined) {
      updateData.supervisorId = updateWorkPackageDto.supervisorId;
    }
    if (updateWorkPackageDto.inspectionDate !== undefined) {
      updateData.inspectionDate = new Date(updateWorkPackageDto.inspectionDate);
    }
    if (updateWorkPackageDto.inspectionResult !== undefined) {
      updateData.inspectionResult = updateWorkPackageDto.inspectionResult;
    }
    if (updateWorkPackageDto.inspectionNotes !== undefined) {
      updateData.inspectionNotes = updateWorkPackageDto.inspectionNotes;
    }

    const workPackage = await this.prisma.projWorkPackage.update({
      where: { id },
      data: updateData,
      include: {
        phase: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
      },
    });

    // تحديث نسبة تقدم المرحلة
    await this.updatePhaseProgress(existingPackage.phaseId);

    return workPackage;
  }

  /**
   * حذف حزمة عمل
   */
  async remove(id: string) {
    const workPackage = await this.prisma.projWorkPackage.findUnique({
      where: { id },
      include: {
        materials: true,
        expenses: true,
      },
    });

    if (!workPackage) {
      throw new NotFoundException(`حزمة العمل غير موجودة: ${id}`);
    }

    // التحقق من عدم وجود مصروفات مرتبطة
    if (workPackage.expenses.length > 0) {
      throw new BadRequestException(
        `لا يمكن حذف حزمة العمل لأن هناك ${workPackage.expenses.length} مصروفات مرتبطة بها`
      );
    }

    const phaseId = workPackage.phaseId;

    await this.prisma.projWorkPackage.delete({
      where: { id },
    });

    // تحديث نسبة تقدم المرحلة
    await this.updatePhaseProgress(phaseId);

    return { message: 'تم حذف حزمة العمل بنجاح' };
  }

  /**
   * الحصول على حزم عمل مرحلة معينة
   */
  async findByPhase(phaseId: string) {
    const phase = await this.prisma.projProjectPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      throw new NotFoundException(`المرحلة غير موجودة: ${phaseId}`);
    }

    const workPackages = await this.prisma.projWorkPackage.findMany({
      where: { phaseId },
      include: {
        _count: {
          select: {
            materials: true,
            expenses: true,
          },
        },
      },
      orderBy: { packageNumber: 'asc' },
    });

    // حساب الإحصائيات
    const statistics = {
      totalPackages: workPackages.length,
      draftPackages: workPackages.filter((p) => p.status === 'draft').length,
      inProgressPackages: workPackages.filter((p) => p.status === 'in_progress').length,
      completedPackages: workPackages.filter((p) => p.status === 'completed').length,
      totalEstimatedCost: workPackages.reduce(
        (sum, p) => sum + (p.estimatedCost ? Number(p.estimatedCost) : 0),
        0
      ),
      totalActualCost: workPackages.reduce((sum, p) => sum + Number(p.actualCost), 0),
      averageProgress:
        workPackages.length > 0
          ? workPackages.reduce((sum, p) => sum + Number(p.progressPercent), 0) /
            workPackages.length
          : 0,
    };

    return {
      workPackages,
      statistics,
    };
  }

  /**
   * تحديث نسبة تقدم المرحلة بناءً على حزم العمل
   */
  private async updatePhaseProgress(phaseId: string) {
    const workPackages = await this.prisma.projWorkPackage.findMany({
      where: { phaseId },
      select: { progressPercent: true },
    });

    if (workPackages.length === 0) return;

    const averageProgress =
      workPackages.reduce((sum, p) => sum + Number(p.progressPercent), 0) / workPackages.length;

    await this.prisma.projProjectPhase.update({
      where: { id: phaseId },
      data: { progressPercent: new Prisma.Decimal(averageProgress) },
    });

    // الحصول على المرحلة لتحديث المشروع
    const phase = await this.prisma.projProjectPhase.findUnique({
      where: { id: phaseId },
      select: { projectId: true },
    });

    if (phase) {
      await this.updateProjectProgress(phase.projectId);
    }
  }

  /**
   * تحديث نسبة تقدم المشروع
   */
  private async updateProjectProgress(projectId: string) {
    const phases = await this.prisma.projProjectPhase.findMany({
      where: { projectId },
      select: { progressPercent: true },
    });

    if (phases.length === 0) return;

    const averageProgress =
      phases.reduce((sum, p) => sum + Number(p.progressPercent), 0) / phases.length;

    await this.prisma.projProject.update({
      where: { id: projectId },
      data: { progressPercent: new Prisma.Decimal(averageProgress) },
    });
  }

  /**
   * إحصائيات حزم العمل
   */
  async getStatistics(projectId?: string, phaseId?: string) {
    const where: Prisma.ProjWorkPackageWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (phaseId) where.phaseId = phaseId;

    const [total, byStatus, costStats] = await Promise.all([
      this.prisma.projWorkPackage.count({ where }),
      this.prisma.projWorkPackage.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.projWorkPackage.aggregate({
        where,
        _sum: {
          estimatedCost: true,
          contractedAmount: true,
          actualCost: true,
        },
        _avg: {
          progressPercent: true,
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

    return {
      total,
      byStatus: {
        draft: statusCounts['draft'] || 0,
        pending: statusCounts['pending'] || 0,
        in_progress: statusCounts['in_progress'] || 0,
        completed: statusCounts['completed'] || 0,
        on_hold: statusCounts['on_hold'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
      },
      costs: {
        totalEstimated: costStats._sum.estimatedCost
          ? Number(costStats._sum.estimatedCost)
          : 0,
        totalContracted: costStats._sum.contractedAmount
          ? Number(costStats._sum.contractedAmount)
          : 0,
        totalActual: costStats._sum.actualCost ? Number(costStats._sum.actualCost) : 0,
      },
      averageProgress: costStats._avg.progressPercent
        ? Number(costStats._avg.progressPercent)
        : 0,
    };
  }
}
