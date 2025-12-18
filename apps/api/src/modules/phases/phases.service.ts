import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePhaseDto, UpdatePhaseDto, QueryPhasesDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء مرحلة جديدة
   */
  async create(createPhaseDto: CreatePhaseDto) {
    // التحقق من وجود المشروع
    const project = await this.prisma.projProject.findUnique({
      where: { id: createPhaseDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${createPhaseDto.projectId}`);
    }

    // التحقق من عدم تكرار رقم المرحلة في نفس المشروع
    const existingPhase = await this.prisma.projProjectPhase.findUnique({
      where: {
        projectId_phaseNumber: {
          projectId: createPhaseDto.projectId,
          phaseNumber: createPhaseDto.phaseNumber,
        },
      },
    });

    if (existingPhase) {
      throw new BadRequestException(
        `رقم المرحلة ${createPhaseDto.phaseNumber} موجود مسبقاً في هذا المشروع`
      );
    }

    // التحقق من المرحلة التي تعتمد عليها
    if (createPhaseDto.dependsOnPhaseId) {
      const dependsOnPhase = await this.prisma.projProjectPhase.findUnique({
        where: { id: createPhaseDto.dependsOnPhaseId },
      });

      if (!dependsOnPhase) {
        throw new NotFoundException(
          `المرحلة التي تعتمد عليها غير موجودة: ${createPhaseDto.dependsOnPhaseId}`
        );
      }

      if (dependsOnPhase.projectId !== createPhaseDto.projectId) {
        throw new BadRequestException('المرحلة التي تعتمد عليها يجب أن تكون من نفس المشروع');
      }
    }

    // إنشاء المرحلة
    const phase = await this.prisma.projProjectPhase.create({
      data: {
        projectId: createPhaseDto.projectId,
        phaseNumber: createPhaseDto.phaseNumber,
        name: createPhaseDto.name,
        description: createPhaseDto.description,
        allocatedBudget: createPhaseDto.allocatedBudget
          ? new Prisma.Decimal(createPhaseDto.allocatedBudget)
          : null,
        plannedStartDate: new Date(createPhaseDto.plannedStartDate),
        plannedEndDate: new Date(createPhaseDto.plannedEndDate),
        actualStartDate: createPhaseDto.actualStartDate
          ? new Date(createPhaseDto.actualStartDate)
          : null,
        actualEndDate: createPhaseDto.actualEndDate
          ? new Date(createPhaseDto.actualEndDate)
          : null,
        status: createPhaseDto.status || 'pending',
        progressPercent: createPhaseDto.progressPercent
          ? new Prisma.Decimal(createPhaseDto.progressPercent)
          : new Prisma.Decimal(0),
        sequenceOrder: createPhaseDto.sequenceOrder || 1,
        dependsOnPhaseId: createPhaseDto.dependsOnPhaseId,
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
        workPackages: true,
        dependsOn: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
      },
    });

    return phase;
  }

  /**
   * الحصول على قائمة المراحل
   */
  async findAll(query: QueryPhasesDto) {
    const {
      projectId,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'sequenceOrder',
      sortOrder = 'asc',
    } = query;

    const where: Prisma.ProjProjectPhaseWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [phases, total] = await Promise.all([
      this.prisma.projProjectPhase.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              name: true,
            },
          },
          workPackages: {
            select: {
              id: true,
              packageNumber: true,
              name: true,
              status: true,
              progressPercent: true,
            },
          },
          dependsOn: {
            select: {
              id: true,
              phaseNumber: true,
              name: true,
            },
          },
          _count: {
            select: {
              workPackages: true,
              expenses: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projProjectPhase.count({ where }),
    ]);

    return {
      data: phases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على مرحلة بالمعرف
   */
  async findOne(id: string) {
    const phase = await this.prisma.projProjectPhase.findUnique({
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
        workPackages: {
          include: {
            _count: {
              select: {
                materials: true,
                expenses: true,
              },
            },
          },
          orderBy: { packageNumber: 'asc' },
        },
        expenses: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        dependsOn: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
            status: true,
          },
        },
        dependents: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!phase) {
      throw new NotFoundException(`المرحلة غير موجودة: ${id}`);
    }

    return phase;
  }

  /**
   * تحديث مرحلة
   */
  async update(id: string, updatePhaseDto: UpdatePhaseDto) {
    // التحقق من وجود المرحلة
    const existingPhase = await this.prisma.projProjectPhase.findUnique({
      where: { id },
    });

    if (!existingPhase) {
      throw new NotFoundException(`المرحلة غير موجودة: ${id}`);
    }

    // التحقق من عدم تكرار رقم المرحلة
    if (updatePhaseDto.phaseNumber && updatePhaseDto.phaseNumber !== existingPhase.phaseNumber) {
      const duplicatePhase = await this.prisma.projProjectPhase.findUnique({
        where: {
          projectId_phaseNumber: {
            projectId: existingPhase.projectId,
            phaseNumber: updatePhaseDto.phaseNumber,
          },
        },
      });

      if (duplicatePhase) {
        throw new BadRequestException(
          `رقم المرحلة ${updatePhaseDto.phaseNumber} موجود مسبقاً في هذا المشروع`
        );
      }
    }

    // التحقق من المرحلة التي تعتمد عليها
    if (updatePhaseDto.dependsOnPhaseId) {
      if (updatePhaseDto.dependsOnPhaseId === id) {
        throw new BadRequestException('لا يمكن للمرحلة أن تعتمد على نفسها');
      }

      const dependsOnPhase = await this.prisma.projProjectPhase.findUnique({
        where: { id: updatePhaseDto.dependsOnPhaseId },
      });

      if (!dependsOnPhase) {
        throw new NotFoundException(
          `المرحلة التي تعتمد عليها غير موجودة: ${updatePhaseDto.dependsOnPhaseId}`
        );
      }

      if (dependsOnPhase.projectId !== existingPhase.projectId) {
        throw new BadRequestException('المرحلة التي تعتمد عليها يجب أن تكون من نفس المشروع');
      }
    }

    // تحديث المرحلة
    const updateData: Prisma.ProjProjectPhaseUpdateInput = {};

    if (updatePhaseDto.phaseNumber !== undefined) {
      updateData.phaseNumber = updatePhaseDto.phaseNumber;
    }
    if (updatePhaseDto.name !== undefined) {
      updateData.name = updatePhaseDto.name;
    }
    if (updatePhaseDto.description !== undefined) {
      updateData.description = updatePhaseDto.description;
    }
    if (updatePhaseDto.allocatedBudget !== undefined) {
      updateData.allocatedBudget = new Prisma.Decimal(updatePhaseDto.allocatedBudget);
    }
    if (updatePhaseDto.spentAmount !== undefined) {
      updateData.spentAmount = new Prisma.Decimal(updatePhaseDto.spentAmount);
    }
    if (updatePhaseDto.plannedStartDate !== undefined) {
      updateData.plannedStartDate = new Date(updatePhaseDto.plannedStartDate);
    }
    if (updatePhaseDto.plannedEndDate !== undefined) {
      updateData.plannedEndDate = new Date(updatePhaseDto.plannedEndDate);
    }
    if (updatePhaseDto.actualStartDate !== undefined) {
      updateData.actualStartDate = new Date(updatePhaseDto.actualStartDate);
    }
    if (updatePhaseDto.actualEndDate !== undefined) {
      updateData.actualEndDate = new Date(updatePhaseDto.actualEndDate);
    }
    if (updatePhaseDto.status !== undefined) {
      updateData.status = updatePhaseDto.status;
    }
    if (updatePhaseDto.progressPercent !== undefined) {
      updateData.progressPercent = new Prisma.Decimal(updatePhaseDto.progressPercent);
    }
    if (updatePhaseDto.sequenceOrder !== undefined) {
      updateData.sequenceOrder = updatePhaseDto.sequenceOrder;
    }
    if (updatePhaseDto.dependsOnPhaseId !== undefined) {
      updateData.dependsOn = updatePhaseDto.dependsOnPhaseId
        ? { connect: { id: updatePhaseDto.dependsOnPhaseId } }
        : { disconnect: true };
    }

    const phase = await this.prisma.projProjectPhase.update({
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
        workPackages: true,
        dependsOn: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
      },
    });

    // تحديث نسبة تقدم المشروع
    await this.updateProjectProgress(existingPhase.projectId);

    return phase;
  }

  /**
   * حذف مرحلة
   */
  async remove(id: string) {
    const phase = await this.prisma.projProjectPhase.findUnique({
      where: { id },
      include: {
        workPackages: true,
        dependents: true,
      },
    });

    if (!phase) {
      throw new NotFoundException(`المرحلة غير موجودة: ${id}`);
    }

    // التحقق من عدم وجود مراحل تعتمد على هذه المرحلة
    if (phase.dependents.length > 0) {
      throw new BadRequestException(
        `لا يمكن حذف هذه المرحلة لأن هناك مراحل أخرى تعتمد عليها`
      );
    }

    const projectId = phase.projectId;

    await this.prisma.projProjectPhase.delete({
      where: { id },
    });

    // تحديث نسبة تقدم المشروع
    await this.updateProjectProgress(projectId);

    return { message: 'تم حذف المرحلة بنجاح' };
  }

  /**
   * الحصول على مراحل مشروع معين
   */
  async findByProject(projectId: string) {
    const project = await this.prisma.projProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`المشروع غير موجود: ${projectId}`);
    }

    const phases = await this.prisma.projProjectPhase.findMany({
      where: { projectId },
      include: {
        workPackages: {
          select: {
            id: true,
            packageNumber: true,
            name: true,
            status: true,
            progressPercent: true,
            estimatedCost: true,
            actualCost: true,
          },
          orderBy: { packageNumber: 'asc' },
        },
        dependsOn: {
          select: {
            id: true,
            phaseNumber: true,
            name: true,
          },
        },
        _count: {
          select: {
            workPackages: true,
            expenses: true,
          },
        },
      },
      orderBy: { sequenceOrder: 'asc' },
    });

    // حساب الإحصائيات
    const statistics = {
      totalPhases: phases.length,
      pendingPhases: phases.filter((p) => p.status === 'pending').length,
      inProgressPhases: phases.filter((p) => p.status === 'in_progress').length,
      completedPhases: phases.filter((p) => p.status === 'completed').length,
      totalAllocatedBudget: phases.reduce(
        (sum, p) => sum + (p.allocatedBudget ? Number(p.allocatedBudget) : 0),
        0
      ),
      totalSpentAmount: phases.reduce((sum, p) => sum + Number(p.spentAmount), 0),
      averageProgress:
        phases.length > 0
          ? phases.reduce((sum, p) => sum + Number(p.progressPercent), 0) / phases.length
          : 0,
    };

    return {
      phases,
      statistics,
    };
  }

  /**
   * تحديث نسبة تقدم المشروع بناءً على المراحل
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
   * إحصائيات المراحل
   */
  async getStatistics(projectId?: string) {
    const where: Prisma.ProjProjectPhaseWhereInput = projectId ? { projectId } : {};

    const [total, byStatus, budgetStats] = await Promise.all([
      this.prisma.projProjectPhase.count({ where }),
      this.prisma.projProjectPhase.groupBy({
        by: ['status'],
        where,
        _count: { status: true },