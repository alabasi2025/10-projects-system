import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء عقد جديد
   */
  async create(data: Prisma.ProjContractCreateInput) {
    // التحقق من عدم وجود عقد بنفس الرقم
    const existing = await this.prisma.projContract.findUnique({
      where: { contractNumber: data.contractNumber },
    });

    if (existing) {
      throw new ConflictException('يوجد عقد بنفس الرقم');
    }

    return this.prisma.projContract.create({
      data,
      include: {
        contractor: true,
        rates: true,
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
  }

  /**
   * الحصول على قائمة العقود
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    contractorId?: string;
    contractType?: string;
  }) {
    const { page = 1, limit = 10, search, status, contractorId, contractType } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjContractWhereInput = {};

    if (search) {
      where.OR = [
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { contractor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    const [contracts, total] = await Promise.all([
      this.prisma.projContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contractor: {
            select: {
              id: true,
              name: true,
              contractorCode: true,
            },
          },
          _count: {
            select: {
              invoices: true,
              rates: true,
            },
          },
        },
      }),
      this.prisma.projContract.count({ where }),
    ]);

    return {
      data: contracts,
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
   * الحصول على عقد بالمعرف
   */
  async findOne(id: string) {
    const contract = await this.prisma.projContract.findUnique({
      where: { id },
      include: {
        contractor: true,
        rates: true,
        invoices: {
          orderBy: { invoiceDate: 'desc' },
        },
        _count: {
          select: {
            invoices: true,
            rates: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    return contract;
  }

  /**
   * تحديث عقد
   */
  async update(id: string, data: Prisma.ProjContractUpdateInput) {
    await this.findOne(id);

    return this.prisma.projContract.update({
      where: { id },
      data,
      include: {
        contractor: true,
        rates: true,
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
  }

  /**
   * حذف عقد
   */
  async remove(id: string) {
    const contract = await this.findOne(id);

    // التحقق من عدم وجود مستخلصات مرتبطة
    if (contract._count.invoices > 0) {
      throw new ConflictException('لا يمكن حذف عقد لديه مستخلصات مرتبطة');
    }

    return this.prisma.projContract.delete({
      where: { id },
    });
  }

  /**
   * توليد رقم عقد جديد
   */
  async generateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastContract = await this.prisma.projContract.findFirst({
      where: {
        contractNumber: {
          startsWith: `CNT-${year}`,
        },
      },
      orderBy: { contractNumber: 'desc' },
      select: { contractNumber: true },
    });

    if (!lastContract) {
      return `CNT-${year}-001`;
    }

    const lastNumber = parseInt(lastContract.contractNumber.split('-')[2] || '0');
    const newNumber = lastNumber + 1;
    return `CNT-${year}-${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * إضافة سعر للعقد
   */
  async addRate(contractId: string, data: Prisma.ProjContractRateCreateWithoutContractInput) {
    await this.findOne(contractId);

    return this.prisma.projContractRate.create({
      data: {
        ...data,
        contract: {
          connect: { id: contractId },
        },
      },
    });
  }

  /**
   * تحديث سعر في العقد
   */
  async updateRate(rateId: string, data: Prisma.ProjContractRateUpdateInput) {
    return this.prisma.projContractRate.update({
      where: { id: rateId },
      data,
    });
  }

  /**
   * حذف سعر من العقد
   */
  async removeRate(rateId: string) {
    return this.prisma.projContractRate.delete({
      where: { id: rateId },
    });
  }

  /**
   * الحصول على إحصائيات العقود
   */
  async getStatistics() {
    const [total, byStatus, byType, totalValue] = await Promise.all([
      this.prisma.projContract.count(),
      this.prisma.projContract.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.projContract.groupBy({
        by: ['contractType'],
        _count: { contractType: true },
      }),
      this.prisma.projContract.aggregate({
        _sum: { contractValue: true },
      }),
    ]);

    const statusCounts: { [key: string]: number } = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count.status;
    }

    const typeCounts: { [key: string]: number } = {};
    for (const item of byType) {
      typeCounts[item.contractType] = item._count.contractType;
    }

    return {
      total,
      totalValue: totalValue._sum.contractValue || 0,
      byStatus: statusCounts,
      byType: typeCounts,
    };
  }
}
