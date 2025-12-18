import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * واجهة القيد المحاسبي
 */
export interface AccountingEntry {
  entryNumber: string;
  entryDate: Date;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  referenceType: 'expense' | 'invoice' | 'payment';
  referenceId: string;
  projectId?: string;
}

/**
 * واجهة بيانات الموظف من نظام HR
 */
export interface HREmployee {
  id: string;
  employeeNumber: string;
  fullName: string;
  fullNameEn?: string;
  department: string;
  position: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

/**
 * واجهة بيانات المورد من نظام الموردين
 */
export interface SupplierData {
  id: string;
  supplierCode: string;
  name: string;
  taxNumber?: string;
  bankAccount?: string;
  iban?: string;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  // URLs للأنظمة الخارجية (يتم تكوينها من البيئة)
  private readonly accountingApiUrl = process.env.ACCOUNTING_API_URL || 'http://localhost:3001/api';
  private readonly hrApiUrl = process.env.HR_API_URL || 'http://localhost:3002/api';
  private readonly suppliersApiUrl = process.env.SUPPLIERS_API_URL || 'http://localhost:3003/api';

  constructor(private prisma: PrismaService) {}

  // ==================== التكامل المحاسبي ====================

  /**
   * إنشاء قيد محاسبي للمصروف
   */
  async createExpenseEntry(expenseId: string): Promise<AccountingEntry | null> {
    const expense = await this.prisma.projProjectExpense.findUnique({
      where: { id: expenseId },
      include: {
        project: true,
      },
    });

    if (!expense) {
      this.logger.warn(`Expense not found: ${expenseId}`);
      return null;
    }

    const entry: AccountingEntry = {
      entryNumber: `JE-EXP-${expense.expenseNumber}`,
      entryDate: expense.expenseDate,
      description: `مصروف مشروع: ${expense.project.name} - ${expense.description}`,
      debitAccount: this.getExpenseAccount(expense.expenseCategory),
      creditAccount: this.getPaymentAccount(expense.paymentMethod || 'cash'),
      amount: Number(expense.amount),
      currency: expense.project.currency,
      referenceType: 'expense',
      referenceId: expense.id,
      projectId: expense.projectId,
    };

    // محاكاة إرسال القيد للنظام المحاسبي
    const result = await this.sendToAccountingSystem(entry);
    
    if (result.success) {
      // تحديث المصروف بمعرف القيد المحاسبي
      await this.prisma.projProjectExpense.update({
        where: { id: expenseId },
        data: {
          accountingEntryId: result.entryId,
        },
      });
    }

    return entry;
  }

  /**
   * إنشاء قيد محاسبي للمستخلص
   */
  async createInvoiceEntry(invoiceId: string): Promise<AccountingEntry | null> {
    const invoice = await this.prisma.projContractorInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        contractor: true,
        contract: true,
      },
    });

    if (!invoice) {
      this.logger.warn(`Invoice not found: ${invoiceId}`);
      return null;
    }

    const entry: AccountingEntry = {
      entryNumber: `JE-INV-${invoice.invoiceNumber}`,
      entryDate: invoice.invoiceDate,
      description: `مستخلص مقاول: ${invoice.contractor.name} - ${invoice.invoiceNumber}`,
      debitAccount: '5100', // حساب تكاليف المشاريع
      creditAccount: '2100', // حساب الموردين والمقاولين
      amount: Number(invoice.netAmount),
      currency: invoice.contract.currency,
      referenceType: 'invoice',
      referenceId: invoice.id,
      projectId: invoice.projectId || undefined,
    };

    const result = await this.sendToAccountingSystem(entry);
    
    return entry;
  }

  /**
   * إنشاء قيد محاسبي لدفع المستخلص
   */
  async createPaymentEntry(invoiceId: string, paymentOrderId: string): Promise<AccountingEntry | null> {
    const invoice = await this.prisma.projContractorInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        contractor: true,
        contract: true,
      },
    });

    if (!invoice) {
      this.logger.warn(`Invoice not found: ${invoiceId}`);
      return null;
    }

    const entry: AccountingEntry = {
      entryNumber: `JE-PAY-${paymentOrderId}`,
      entryDate: new Date(),
      description: `دفع مستخلص: ${invoice.contractor.name} - ${invoice.invoiceNumber}`,
      debitAccount: '2100', // حساب الموردين والمقاولين
      creditAccount: '1100', // حساب البنك
      amount: Number(invoice.netAmount),
      currency: invoice.contract.currency,
      referenceType: 'payment',
      referenceId: paymentOrderId,
      projectId: invoice.projectId || undefined,
    };

    const result = await this.sendToAccountingSystem(entry);
    
    return entry;
  }

  /**
   * إرسال القيد للنظام المحاسبي
   */
  private async sendToAccountingSystem(entry: AccountingEntry): Promise<{ success: boolean; entryId?: string }> {
    try {
      // محاكاة الاتصال بالنظام المحاسبي
      // في الإنتاج، سيتم استبدال هذا بـ HTTP request فعلي
      this.logger.log(`Sending accounting entry: ${entry.entryNumber}`);
      
      // محاكاة نجاح العملية
      return {
        success: true,
        entryId: `ACC-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send accounting entry: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * الحصول على حساب المصروفات حسب الفئة
   */
  private getExpenseAccount(category: string): string {
    const accounts: { [key: string]: string } = {
      'materials': '5110', // مواد
      'labor': '5120', // عمالة
      'equipment': '5130', // معدات
      'services': '5140', // خدمات
      'other': '5190', // أخرى
    };
    return accounts[category] || '5190';
  }

  /**
   * الحصول على حساب الدفع حسب الطريقة
   */
  private getPaymentAccount(method: string): string {
    const accounts: { [key: string]: string } = {
      'cash': '1110', // نقدي
      'bank': '1120', // بنك
      'check': '1130', // شيك
    };
    return accounts[method] || '1110';
  }

  // ==================== التكامل مع الموارد البشرية ====================

  /**
   * جلب قائمة الموظفين من نظام HR
   */
  async getEmployees(params?: {
    department?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<HREmployee[]> {
    try {
      // محاكاة جلب البيانات من نظام HR
      this.logger.log('Fetching employees from HR system');
      
      // بيانات تجريبية
      const mockEmployees: HREmployee[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          employeeNumber: 'EMP-001',
          fullName: 'أحمد محمد العلي',
          fullNameEn: 'Ahmed Mohammed Al-Ali',
          department: 'المشاريع',
          position: 'مدير مشروع',
          email: 'ahmed@company.com',
          phone: '+966501234567',
          isActive: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          employeeNumber: 'EMP-002',
          fullName: 'فاطمة عبدالله السعيد',
          fullNameEn: 'Fatima Abdullah Al-Saeed',
          department: 'المشاريع',
          position: 'مهندس مشاريع',
          email: 'fatima@company.com',
          phone: '+966507654321',
          isActive: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          employeeNumber: 'EMP-003',
          fullName: 'خالد سعد الغامدي',
          fullNameEn: 'Khaled Saad Al-Ghamdi',
          department: 'المشاريع',
          position: 'منسق مشاريع',
          email: 'khaled@company.com',
          phone: '+966509876543',
          isActive: true,
        },
      ];

      let filtered = mockEmployees;

      if (params?.department) {
        filtered = filtered.filter(e => e.department === params.department);
      }

      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.fullName.toLowerCase().includes(search) ||
          e.employeeNumber.toLowerCase().includes(search)
        );
      }

      if (params?.isActive !== undefined) {
        filtered = filtered.filter(e => e.isActive === params.isActive);
      }

      return filtered;
    } catch (error) {
      this.logger.error(`Failed to fetch employees: ${error.message}`);
      return [];
    }
  }

  /**
   * جلب بيانات موظف محدد
   */
  async getEmployee(employeeId: string): Promise<HREmployee | null> {
    try {
      const employees = await this.getEmployees();
      return employees.find(e => e.id === employeeId) || null;
    } catch (error) {
      this.logger.error(`Failed to fetch employee: ${error.message}`);
      return null;
    }
  }

  /**
   * إضافة عضو لفريق المشروع من نظام HR
   */
  async addTeamMemberFromHR(projectId: string, employeeId: string, role: string, responsibilities?: string) {
    const employee = await this.getEmployee(employeeId);
    
    if (!employee) {
      throw new Error('الموظف غير موجود في نظام الموارد البشرية');
    }

    // التحقق من عدم وجود العضو مسبقاً
    const existing = await this.prisma.projProjectTeamMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: employeeId,
        },
      },
    });

    if (existing) {
      throw new Error('الموظف موجود مسبقاً في فريق المشروع');
    }

    return this.prisma.projProjectTeamMember.create({
      data: {
        projectId,
        userId: employeeId,
        role,
        responsibilities,
        startDate: new Date(),
        isActive: true,
      },
    });
  }

  // ==================== التكامل مع نظام الموردين ====================

  /**
   * مزامنة بيانات المقاول مع نظام الموردين
   */
  async syncContractorWithSuppliers(contractorId: string): Promise<SupplierData | null> {
    try {
      const contractor = await this.prisma.projContractor.findUnique({
        where: { id: contractorId },
      });

      if (!contractor) {
        return null;
      }

      // محاكاة إرسال/تحديث البيانات في نظام الموردين
      const supplierData: SupplierData = {
        id: contractor.id,
        supplierCode: contractor.contractorCode,
        name: contractor.name,
        bankAccount: contractor.bankAccount || undefined,
        iban: contractor.iban || undefined,
      };

      this.logger.log(`Syncing contractor ${contractor.contractorCode} with suppliers system`);

      return supplierData;
    } catch (error) {
      this.logger.error(`Failed to sync contractor: ${error.message}`);
      return null;
    }
  }

  /**
   * إنشاء أمر دفع في نظام الموردين
   */
  async createPaymentOrder(invoiceId: string): Promise<{ success: boolean; paymentOrderId?: string }> {
    try {
      const invoice = await this.prisma.projContractorInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          contractor: true,
        },
      });

      if (!invoice) {
        return { success: false };
      }

      // محاكاة إنشاء أمر دفع
      const paymentOrderId = `PO-${Date.now()}`;
      
      this.logger.log(`Creating payment order ${paymentOrderId} for invoice ${invoice.invoiceNumber}`);

      return {
        success: true,
        paymentOrderId,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment order: ${error.message}`);
      return { success: false };
    }
  }

  // ==================== حالة التكامل ====================

  /**
   * فحص حالة الاتصال بالأنظمة الخارجية
   */
  async checkIntegrationStatus(): Promise<{
    accounting: { connected: boolean; url: string };
    hr: { connected: boolean; url: string };
    suppliers: { connected: boolean; url: string };
  }> {
    // محاكاة فحص الاتصال
    return {
      accounting: {
        connected: true,
        url: this.accountingApiUrl,
      },
      hr: {
        connected: true,
        url: this.hrApiUrl,
      },
      suppliers: {
        connected: true,
        url: this.suppliersApiUrl,
      },
    };
  }
}
