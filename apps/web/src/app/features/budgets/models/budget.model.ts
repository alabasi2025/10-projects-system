/**
 * نماذج الميزانية والمصروفات
 */

// نموذج الميزانية
export interface Budget {
  id: string;
  projectId: string;
  budgetVersion: number;
  originalBudget: number;
  adjustments: number;
  currentBudget: number;
  committedAmount: number;
  spentAmount: number;
  remainingBudget: number;
  commitmentPercent: number;
  spentPercent: number;
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  };
}

// حالات الميزانية
export type BudgetStatus = 'draft' | 'active' | 'closed' | 'over_budget';

// نموذج المصروف
export interface Expense {
  id: string;
  projectId: string;
  phaseId?: string;
  workPackageId?: string;
  expenseType: ExpenseType;
  description?: string;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  expenseDate: string;
  journalEntryId?: string;
  createdBy?: string;
  createdAt: string;
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  };
  phase?: {
    id: string;
    phaseNumber: number;
    name: string;
  };
  workPackage?: {
    id: string;
    packageNumber: string;
    name: string;
  };
}

// أنواع المصروفات
export type ExpenseType = 
  | 'contractor_payment' 
  | 'material' 
  | 'labor' 
  | 'equipment' 
  | 'other';

// DTOs
export interface CreateBudgetDto {
  projectId: string;
  originalBudget: number;
  currentBudget?: number;
  status?: BudgetStatus;
}

export interface UpdateBudgetDto {
  originalBudget?: number;
  adjustments?: number;
  currentBudget?: number;
  committedAmount?: number;
  status?: BudgetStatus;
}

export interface CreateExpenseDto {
  projectId: string;
  phaseId?: string;
  workPackageId?: string;
  expenseType: ExpenseType;
  description?: string;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  expenseDate: string;
  createdBy?: string;
  createJournalEntry?: boolean;
}

export interface UpdateExpenseDto {
  phaseId?: string;
  workPackageId?: string;
  expenseType?: ExpenseType;
  description?: string;
  amount?: number;
  referenceType?: string;
  referenceId?: string;
  expenseDate?: string;
}

// إحصائيات الميزانية
export interface BudgetStatistics {
  total: number;
  byStatus: Record<string, number>;
  totalOriginalBudget: number;
  totalCurrentBudget: number;
  totalCommitted: number;
  totalSpent: number;
  totalRemaining: number;
}

// إحصائيات المصروفات
export interface ExpenseStatistics {
  total: number;
  totalAmount: number;
  byType: Record<string, { count: number; amount: number }>;
}

// استجابة القائمة
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
