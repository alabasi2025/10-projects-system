import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// حالات المستخلص
export enum InvoiceStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

// التحولات المسموحة بين الحالات
const ALLOWED_TRANSITIONS: { [key: string]: string[] } = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.SUBMITTED],
  [InvoiceStatus.SUBMITTED]: [InvoiceStatus.UNDER_REVIEW, InvoiceStatus.REJECTED],
  [InvoiceStatus.UNDER_REVIEW]: [InvoiceStatus.APPROVED, InvoiceStatus.REJECTED],
  [InvoiceStatus.APPROVED]: [InvoiceStatus.PAID],
  [InvoiceStatus.REJECTED]: [InvoiceStatus.DRAFT],
  [InvoiceStatus.PAID]: [],
};

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء مستخلص جديد
   */
  async create(data: {
    contractorId: string;
    contractId: string;
    projectId?: string;
    invoiceNumber: string;
    invoiceDate: Date;
    grossAmount: number;
    deductions?: number;
    retentionAmount?: number;
    notes?: string;
  }) {
    // التحقق من عدم وجود مستخلص بنفس الرقم
    const existing = await this.prisma.projContractorInvoice.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    });

    if (existing) {
      throw new ConflictException('يوجد مستخلص بنفس الرقم');
    }

    // حساب المبلغ الصافي
    const deductions = data.deductions || 0;
    const retentionAmount = data.retentionAmount || 0;
    const netAmount = data.grossAmount - deductions - retentionAmount;

    return this.prisma.projContractorInvoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        grossAmount: data.grossAmount,
        deductions,
        retentionAmount,
        netAmount,
        notes: data.notes,
        status: InvoiceStatus.DRAFT,
        contractor: {
          connect: { id: data.contractorId },
        },
        contract: {
          connect: { id: data.contractId },
        },
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * الحصول على قائمة المستخلصات
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    contractorId?: string;
    contractId?: string;
    projectId?: string;
  }) {
    const { page = 1, limit = 10, search, status, contractorId, contractId, projectId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjContractorInvoiceWhereInput = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { contractor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (contractId) {
      where.contractId = contractId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const [invoices, total] = await Promise.all([
      this.prisma.projContractorInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
        include: {
          contractor: {
            select: {
              id: true,
              name: true,
              contractorCode: true,
            },
          },
          contract: {
            select: {
              id: true,
              contractNumber: true,
              contractType: true,
            },
          },
        },
      }),
      this.prisma.projContractorInvoice.count({ where }),
    ]);

    return {
      data: invoices,
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
   * الحصول على مستخلص بالمعرف
   */
  async findOne(id: string) {
    const invoice = await this.prisma.projContractorInvoice.findUnique({
      where: { id },
      include: {
        contractor: true,
        contract: {
          include: {
            rates: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('المستخلص غير موجود');
    }

    return invoice;
  }

  /**
   * تحديث مستخلص
   */
  async update(id: string, data: Prisma.ProjContractorInvoiceUpdateInput) {
    const invoice = await this.findOne(id);

    // لا يمكن تحديث مستخلص بعد الموافقة عليه
    if (invoice.status === InvoiceStatus.APPROVED || invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('لا يمكن تعديل مستخلص تمت الموافقة عليه أو دفعه');
    }

    // إعادة حساب المبلغ الصافي إذا تغيرت المبالغ
    const grossAmount = (data.grossAmount as number) || Number(invoice.grossAmount);
    const deductions = (data.deductions as number) || Number(invoice.deductions);
    const retentionAmount = (data.retentionAmount as number) || Number(invoice.retentionAmount);
    const netAmount = grossAmount - deductions - retentionAmount;

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        ...data,
        netAmount,
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * حذف مستخلص
   */
  async remove(id: string) {
    const invoice = await this.findOne(id);

    // لا يمكن حذف مستخلص بعد التقديم
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('لا يمكن حذف مستخلص تم تقديمه');
    }

    return this.prisma.projContractorInvoice.delete({
      where: { id },
    });
  }

  /**
   * تقديم المستخلص للمراجعة
   */
  async submit(id: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.SUBMITTED);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * بدء مراجعة المستخلص
   */
  async startReview(id: string, reviewerId: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.UNDER_REVIEW);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.UNDER_REVIEW,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * الموافقة على المستخلص
   */
  async approve(id: string, approverId: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.APPROVED);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * رفض المستخلص
   */
  async reject(id: string, reviewerId: string, notes?: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.REJECTED);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.REJECTED,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        notes: notes || invoice.notes,
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * تسجيل دفع المستخلص
   */
  async markAsPaid(id: string, paymentOrderId?: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.PAID);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        paymentOrderId,
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * إعادة المستخلص للمسودة (بعد الرفض)
   */
  async revertToDraft(id: string) {
    const invoice = await this.findOne(id);
    this.validateTransition(invoice.status, InvoiceStatus.DRAFT);

    return this.prisma.projContractorInvoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.DRAFT,
        submittedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        approvedBy: null,
        approvedAt: null,
      },
      include: {
        contractor: true,
        contract: true,
      },
    });
  }

  /**
   * توليد رقم مستخلص جديد
   */
  async generateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    const lastInvoice = await this.prisma.projContractorInvoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}${month}`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    if (!lastInvoice) {
      return `INV-${year}${month}-001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0');
    const newNumber = lastNumber + 1;
    return `INV-${year}${month}-${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * الحصول على إحصائيات المستخلصات
   */
  async getStatistics(projectId?: string) {
    const where: Prisma.ProjContractorInvoiceWhereInput = projectId ? { projectId } : {};

    const [total, byStatus, totals] = await Promise.all([
      this.prisma.projContractorInvoice.count({ where }),
      this.prisma.projContractorInvoice.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { netAmount: true },
      }),
      this.prisma.projContractorInvoice.aggregate({
        where,
        _sum: {
          grossAmount: true,
          deductions: true,
          retentionAmount: true,
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
      totals: {
        grossAmount: Number(totals._sum.grossAmount) || 0,
        deductions: Number(totals._sum.deductions) || 0,
        retentionAmount: Number(totals._sum.retentionAmount) || 0,
        netAmount: Number(totals._sum.netAmount) || 0,
      },
    };
  }

  /**
   * التحقق من صحة التحول بين الحالات
   */
  private validateTransition(currentStatus: string, newStatus: string) {
    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `لا يمكن تغيير حالة المستخلص من "${currentStatus}" إلى "${newStatus}"`
      );
    }
  }
}
