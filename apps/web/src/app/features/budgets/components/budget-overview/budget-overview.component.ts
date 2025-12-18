import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BudgetService } from '../../services/budget.service';
import { Budget, Expense, CreateExpenseDto, ExpenseStatistics } from '../../models/budget.model';
import { ProjectsService } from '../../../projects/services/projects.service';
import { Project } from '../../../projects/models/project.model';
import { WbsService } from '../../../wbs/services/wbs.service';
import { Phase, WorkPackage } from '../../../wbs/models/wbs.model';

@Component({
  selector: 'app-budget-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './budget-overview.component.html',
  styleUrls: ['./budget-overview.component.scss'],
})
export class BudgetOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budgetService = inject(BudgetService);
  private projectsService = inject(ProjectsService);
  private wbsService = inject(WbsService);

  // البيانات
  project: Project | null = null;
  budget: Budget | null = null;
  expenses: Expense[] = [];
  expenseStatistics: ExpenseStatistics | null = null;
  phases: Phase[] = [];
  workPackages: WorkPackage[] = [];

  // حالة التحميل
  loading = true;
  error: string | null = null;

  // نموذج إضافة مصروف
  showExpenseForm = false;
  expenseForm: CreateExpenseDto = this.getEmptyExpenseForm();

  // أنواع المصروفات
  expenseTypes = [
    { value: 'contractor_payment', label: 'دفعة مقاول' },
    { value: 'material', label: 'مواد' },
    { value: 'labor', label: 'عمالة' },
    { value: 'equipment', label: 'معدات' },
    { value: 'other', label: 'أخرى' },
  ];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const projectId = params['projectId'];
      if (projectId) {
        this.loadProjectData(projectId);
      }
    });
  }

  /**
   * تحميل بيانات المشروع والميزانية
   */
  loadProjectData(projectId: string): void {
    this.loading = true;
    this.error = null;

    // تحميل المشروع
    this.projectsService.getProject(projectId).subscribe({
      next: (response) => {
        this.project = response.data;
        this.expenseForm.projectId = projectId;
        this.loadBudget(projectId);
        this.loadExpenses(projectId);
        this.loadPhases(projectId);
      },
      error: (err) => {
        this.error = 'فشل في تحميل بيانات المشروع';
        this.loading = false;
        console.error('Error loading project:', err);
      },
    });
  }

  /**
   * تحميل الميزانية
   */
  loadBudget(projectId: string): void {
    this.budgetService.getBudgetByProject(projectId).subscribe({
      next: (response) => {
        this.budget = response.budget;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading budget:', err);
        this.loading = false;
      },
    });
  }

  /**
   * تحميل المصروفات
   */
  loadExpenses(projectId: string): void {
    this.budgetService.getExpenses({ projectId, limit: 50 }).subscribe({
      next: (response) => {
        this.expenses = response.data;
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
      },
    });

    this.budgetService.getExpenseStatistics(projectId).subscribe({
      next: (stats) => {
        this.expenseStatistics = stats;
      },
      error: (err) => {
        console.error('Error loading expense statistics:', err);
      },
    });
  }

  /**
   * تحميل المراحل
   */
  loadPhases(projectId: string): void {
    this.wbsService.getPhasesByProject(projectId).subscribe({
      next: (response) => {
        this.phases = response.phases;
      },
      error: (err) => {
        console.error('Error loading phases:', err);
      },
    });
  }

  /**
   * تحميل حزم العمل للمرحلة المحددة
   */
  loadWorkPackages(phaseId: string): void {
    if (!phaseId) {
      this.workPackages = [];
      return;
    }

    this.wbsService.getWorkPackages({ phaseId }).subscribe({
      next: (response: { data: WorkPackage[] }) => {
        this.workPackages = response.data;
      },
      error: (err: Error) => {
        console.error('Error loading work packages:', err);
      },
    });
  }

  /**
   * إنشاء ميزانية جديدة
   */
  createBudget(): void {
    if (!this.project) return;

    const budgetData = {
      projectId: this.project.id,
      originalBudget: this.project.estimatedBudget || 0,
      currentBudget: this.project.estimatedBudget || 0,
      status: 'active' as const,
    };

    this.budgetService.createBudget(budgetData).subscribe({
      next: (budget) => {
        this.budget = budget;
      },
      error: (err) => {
        console.error('Error creating budget:', err);
        alert('فشل في إنشاء الميزانية');
      },
    });
  }

  /**
   * فتح نموذج إضافة مصروف
   */
  openExpenseForm(): void {
    this.expenseForm = this.getEmptyExpenseForm();
    if (this.project) {
      this.expenseForm.projectId = this.project.id;
    }
    this.showExpenseForm = true;
  }

  /**
   * إغلاق نموذج المصروف
   */
  closeExpenseForm(): void {
    this.showExpenseForm = false;
    this.expenseForm = this.getEmptyExpenseForm();
    this.workPackages = [];
  }

  /**
   * عند تغيير المرحلة
   */
  onPhaseChange(): void {
    if (this.expenseForm.phaseId) {
      this.loadWorkPackages(this.expenseForm.phaseId);
    } else {
      this.workPackages = [];
    }
    this.expenseForm.workPackageId = undefined;
  }

  /**
   * حفظ المصروف
   */
  saveExpense(): void {
    if (!this.validateExpenseForm()) {
      return;
    }

    this.budgetService.createExpense(this.expenseForm).subscribe({
      next: () => {
        this.closeExpenseForm();
        if (this.project) {
          this.loadBudget(this.project.id);
          this.loadExpenses(this.project.id);
        }
      },
      error: (err) => {
        console.error('Error creating expense:', err);
        alert('فشل في إنشاء المصروف');
      },
    });
  }

  /**
   * حذف مصروف
   */
  deleteExpense(expense: Expense): void {
    if (!confirm(`هل أنت متأكد من حذف المصروف "${expense.description || expense.expenseType}"؟`)) {
      return;
    }

    this.budgetService.deleteExpense(expense.id).subscribe({
      next: () => {
        if (this.project) {
          this.loadBudget(this.project.id);
          this.loadExpenses(this.project.id);
        }
      },
      error: (err) => {
        console.error('Error deleting expense:', err);
        alert('فشل في حذف المصروف');
      },
    });
  }

  /**
   * العودة لقائمة المشاريع
   */
  goBack(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * الذهاب لشاشة WBS
   */
  goToWbs(): void {
    if (this.project) {
      this.router.navigate(['/projects', this.project.id, 'wbs']);
    }
  }

  /**
   * تنسيق المبلغ
   */
  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) {
      return '0';
    }
    return new Intl.NumberFormat('ar-SA').format(amount);
  }

  /**
   * تنسيق التاريخ
   */
  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }
    return new Date(date).toLocaleDateString('ar-SA');
  }

  /**
   * الحصول على لون نوع المصروف
   */
  getExpenseTypeColor(type: string): string {
    return this.budgetService.getExpenseTypeColor(type);
  }

  /**
   * الحصول على اسم نوع المصروف
   */
  getExpenseTypeLabel(type: string): string {
    return this.budgetService.getExpenseTypeLabel(type);
  }

  /**
   * حساب نسبة الصرف
   */
  get spentPercentage(): number {
    if (!this.budget || !this.budget.currentBudget) {
      return 0;
    }
    return Math.round((Number(this.budget.spentAmount) / Number(this.budget.currentBudget)) * 100);
  }

  /**
   * حساب نسبة الالتزام
   */
  get committedPercentage(): number {
    if (!this.budget || !this.budget.currentBudget) {
      return 0;
    }
    return Math.round((Number(this.budget.committedAmount) / Number(this.budget.currentBudget)) * 100);
  }

  /**
   * الحصول على نموذج مصروف فارغ
   */
  private getEmptyExpenseForm(): CreateExpenseDto {
    return {
      projectId: '',
      phaseId: undefined,
      workPackageId: undefined,
      expenseType: 'material',
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      createJournalEntry: true,
    };
  }

  /**
   * التحقق من صحة نموذج المصروف
   */
  private validateExpenseForm(): boolean {
    if (!this.expenseForm.amount || this.expenseForm.amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return false;
    }
    if (!this.expenseForm.expenseDate) {
      alert('يرجى إدخال تاريخ المصروف');
      return false;
    }
    return true;
  }
}
