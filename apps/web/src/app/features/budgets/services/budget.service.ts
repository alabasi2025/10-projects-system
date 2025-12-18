import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Budget,
  Expense,
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  BudgetStatistics,
  ExpenseStatistics,
  PaginatedResponse,
} from '../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private http = inject(HttpClient);
  private budgetsUrl = `${environment.apiUrl}/budgets`;
  private expensesUrl = `${environment.apiUrl}/expenses`;

  // ==================== الميزانيات (Budgets) ====================

  /**
   * الحصول على قائمة الميزانيات
   */
  getBudgets(params?: {
    projectId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Budget>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Budget>>(this.budgetsUrl, { params: httpParams });
  }

  /**
   * الحصول على ميزانية مشروع
   */
  getBudgetByProject(projectId: string): Observable<{
    budget: Budget | null;
    history: Budget[];
  }> {
    return this.http.get<{ budget: Budget | null; history: Budget[] }>(
      `${this.budgetsUrl}/project/${projectId}`
    );
  }

  /**
   * الحصول على ميزانية بالمعرف
   */
  getBudget(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.budgetsUrl}/${id}`);
  }

  /**
   * إنشاء ميزانية جديدة
   */
  createBudget(budget: CreateBudgetDto): Observable<Budget> {
    return this.http.post<Budget>(this.budgetsUrl, budget);
  }

  /**
   * تحديث ميزانية
   */
  updateBudget(id: string, budget: UpdateBudgetDto): Observable<Budget> {
    return this.http.put<Budget>(`${this.budgetsUrl}/${id}`, budget);
  }

  /**
   * حذف ميزانية
   */
  deleteBudget(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.budgetsUrl}/${id}`);
  }

  /**
   * إحصائيات الميزانيات
   */
  getBudgetStatistics(projectId?: string): Observable<BudgetStatistics> {
    let httpParams = new HttpParams();
    if (projectId) {
      httpParams = httpParams.set('projectId', projectId);
    }
    return this.http.get<BudgetStatistics>(`${this.budgetsUrl}/statistics`, { params: httpParams });
  }

  // ==================== المصروفات (Expenses) ====================

  /**
   * الحصول على قائمة المصروفات
   */
  getExpenses(params?: {
    projectId?: string;
    phaseId?: string;
    workPackageId?: string;
    expenseType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<Expense>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Expense>>(this.expensesUrl, { params: httpParams });
  }

  /**
   * الحصول على مصروف بالمعرف
   */
  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.expensesUrl}/${id}`);
  }

  /**
   * إنشاء مصروف جديد
   */
  createExpense(expense: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(this.expensesUrl, expense);
  }

  /**
   * تحديث مصروف
   */
  updateExpense(id: string, expense: UpdateExpenseDto): Observable<Expense> {
    return this.http.put<Expense>(`${this.expensesUrl}/${id}`, expense);
  }

  /**
   * حذف مصروف
   */
  deleteExpense(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.expensesUrl}/${id}`);
  }

  /**
   * إحصائيات المصروفات
   */
  getExpenseStatistics(projectId?: string): Observable<ExpenseStatistics> {
    let httpParams = new HttpParams();
    if (projectId) {
      httpParams = httpParams.set('projectId', projectId);
    }
    return this.http.get<ExpenseStatistics>(`${this.expensesUrl}/statistics`, { params: httpParams });
  }

  // ==================== مساعدات ====================

  /**
   * الحصول على لون حالة الميزانية
   */
  getBudgetStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: '#6b7280',
      active: '#10b981',
      closed: '#3b82f6',
      over_budget: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  /**
   * الحصول على اسم حالة الميزانية
   */
  getBudgetStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      active: 'نشطة',
      closed: 'مغلقة',
      over_budget: 'تجاوز الميزانية',
    };
    return labels[status] || status;
  }

  /**
   * الحصول على لون نوع المصروف
   */
  getExpenseTypeColor(type: string): string {
    const colors: Record<string, string> = {
      contractor_payment: '#8b5cf6',
      material: '#3b82f6',
      labor: '#f59e0b',
      equipment: '#10b981',
      other: '#6b7280',
    };
    return colors[type] || '#6b7280';
  }

  /**
   * الحصول على اسم نوع المصروف
   */
  getExpenseTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      contractor_payment: 'دفعة مقاول',
      material: 'مواد',
      labor: 'عمالة',
      equipment: 'معدات',
      other: 'أخرى',
    };
    return labels[type] || type;
  }
}
