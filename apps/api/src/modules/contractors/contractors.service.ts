import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContractorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء مقاول جديد
   */
  async create(data: Prisma.ProjContractorCreateInput) {
    // التحقق من عدم وجود مقاول بنفس الكود
    const existing = await this.prisma.projContractor.findUnique({
      where: { contractorCode: data.contractorCode },
    });

    if (existing) {
      throw new ConflictException('يوجد مقاول بنفس الكود');
    }

    return this.prisma.projContractor.create({
      data,
      include: {
        contracts: true,
        _count: {
          select: {
            contracts: true,
            invoices: true,
          },
        },
      },
    });
  }

  /**
   * الحصول على قائمة المقاولين
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    contractorType?: string;
  }) {
    const { page = 1, limit = 10, search, status, contractorType } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjContractorWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contractorCode: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (contractorType) {
      where.contractorType = contractorType;
    }

    const [contractors, total] = await Promise.all([
      this.prisma.projContractor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              contracts: true,
              invoices: true,
            },
          },
        },
      }),
      this.prisma.projContractor.count({ where }),
    ]);

    return {
      data: contractors,
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
   * الحصول على مقاول بالمعرف
   */
  async findOne(id: string) {
    const contractor = await this.prisma.projContractor.findUnique({
      where: { id },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            contracts: true,
            invoices: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('المقاول غير موجود');
    }

    return contractor;
  }

  /**
   * تحديث مقاول
   */
  async update(id: string, data: Prisma.ProjContractorUpdateInput) {
    await this.findOne(id);

    return this.prisma.projContractor.update({
      where: { id },
      data,
      include: {
        contracts: true,
        _count: {
          select: {
            contracts: true,
            invoices: true,
          },
        },
      },
    });
  }

  /**
   * حذف مقاول
   */
  async remove(id: string) {
    const contractor = await this.findOne(id);

    // التحقق من عدم وجود عقود مرتبطة
    if (contractor._count.contracts > 0) {
      throw new ConflictException('لا يمكن حذف مقاول لديه عقود مرتبطة');
    }

    return this.prisma.projContractor.delete({
      where: { id },
    });
  }

  /**
   * توليد كود مقاول جديد
   */
  async generateCode(): Promise<string> {
    const lastContractor = await this.prisma.projContractor.findFirst({
      orderBy: { contractorCode: 'desc' },
      select: { contractorCode: true },
    });

    if (!lastContractor) {
      return 'CONT-001';
    }

    const lastNumber = parseInt(lastContractor.contractorCode.split('-')[1] || '0');
    const newNumber = lastNumber + 1;
    return `CONT-${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * الحصول على إحصائيات المقاولين
   */
  async getStatistics() {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.projContractor.count(),
      this.prisma.projContractor.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.projContractor.groupBy({
        by: ['contractorType'],
        _count: { contractorType: true },
      }),
    ]);

    const statusCounts: { [key: string]: number } = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count.status;
    }

    const typeCounts: { [key: string]: number } = {};
    for (const item of byType) {
      if (item.contractorType) {
        typeCounts[item.contractorType] = item._count.contractorType;
      }
    }

    return {
      total,
      byStatus: statusCounts,
      byType: typeCounts,
    };
  }
}
