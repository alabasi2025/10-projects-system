import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WbsService } from '../../services/wbs.service';
import { Phase, WorkPackage, PhaseStatistics, CreatePhaseDto, CreateWorkPackageDto } from '../../models/wbs.model';
import { ProjectsService } from '../../../projects/services/projects.service';
import { Project } from '../../../projects/models/project.model';

@Component({
  selector: 'app-wbs-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wbs-tree.component.html',
  styleUrls: ['./wbs-tree.component.scss'],
})
export class WbsTreeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private wbsService = inject(WbsService);
  private projectsService = inject(ProjectsService);

  // البيانات
  project: Project | null = null;
  phases: Phase[] = [];
  statistics: PhaseStatistics | null = null;

  // حالة التحميل
  loading = true;
  error: string | null = null;

  // حالة العرض
  expandedPhases: Set<string> = new Set();
  selectedItem: { type: 'phase' | 'work-package'; id: string } | null = null;

  // نموذج إضافة مرحلة
  showPhaseForm = false;
  phaseForm: CreatePhaseDto = this.getEmptyPhaseForm();

  // نموذج إضافة حزمة عمل
  showWorkPackageForm = false;
  selectedPhaseId: string | null = null;
  workPackageForm: CreateWorkPackageDto = this.getEmptyWorkPackageForm();

  // حالات المراحل وحزم العمل
  phaseStatuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'on_hold', label: 'معلق' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  workPackageStatuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'on_hold', label: 'معلق' },
    { value: 'inspection_pending', label: 'بانتظار الفحص' },
    { value: 'inspection_passed', label: 'اجتاز الفحص' },
    { value: 'inspection_failed', label: 'فشل الفحص' },
    { value: 'cancelled', label: 'ملغي' },
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
   * تحميل بيانات المشروع والمراحل
   */
  loadProjectData(projectId: string): void {
    this.loading = true;
    this.error = null;

    // تحميل المشروع
    this.projectsService.getProject(projectId).subscribe({
      next: (response) => {
        this.project = response.data;
        this.phaseForm.projectId = projectId;
        this.workPackageForm.projectId = projectId;
        this.loadPhases(projectId);
      },
      error: (err: Error) => {
        this.error = 'فشل في تحميل بيانات المشروع';
        this.loading = false;
        console.error('Error loading project:', err);
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
        this.statistics = response.statistics;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'فشل في تحميل المراحل';
        this.loading = false;
        console.error('Error loading phases:', err);
      },
    });
  }

  /**
   * توسيع/طي مرحلة
   */
  togglePhase(phaseId: string): void {
    if (this.expandedPhases.has(phaseId)) {
      this.expandedPhases.delete(phaseId);
    } else {
      this.expandedPhases.add(phaseId);
    }
  }

  /**
   * هل المرحلة موسعة؟
   */
  isPhaseExpanded(phaseId: string): boolean {
    return this.expandedPhases.has(phaseId);
  }

  /**
   * اختيار عنصر
   */
  selectItem(type: 'phase' | 'work-package', id: string): void {
    this.selectedItem = { type, id };
  }

  /**
   * هل العنصر مختار؟
   */
  isSelected(type: 'phase' | 'work-package', id: string): boolean {
    return this.selectedItem?.type === type && this.selectedItem?.id === id;
  }

  /**
   * الحصول على لون الحالة
   */
  getStatusColor(status: string): string {
    return this.wbsService.getStatusColor(status);
  }

  /**
   * الحصول على اسم الحالة
   */
  getStatusLabel(status: string): string {
    return this.wbsService.getStatusLabel(status);
  }

  /**
   * فتح نموذج إضافة مرحلة
   */
  openPhaseForm(): void {
    this.phaseForm = this.getEmptyPhaseForm();
    if (this.project) {
      this.phaseForm.projectId = this.project.id;
      this.phaseForm.phaseNumber = this.phases.length + 1;
      this.phaseForm.sequenceOrder = this.phases.length + 1;
    }
    this.showPhaseForm = true;
  }

  /**
   * إغلاق نموذج المرحلة
   */
  closePhaseForm(): void {
    this.showPhaseForm = false;
    this.phaseForm = this.getEmptyPhaseForm();
  }

  /**
   * حفظ المرحلة
   */
  savePhase(): void {
    if (!this.validatePhaseForm()) {
      return;
    }

    this.wbsService.createPhase(this.phaseForm).subscribe({
      next: (phase: Phase) => {
        this.phases.push(phase);
        this.closePhaseForm();
        if (this.project) {
          this.loadPhases(this.project.id);
        }
      },
      error: (err: Error) => {
        console.error('Error creating phase:', err);
        alert('فشل في إنشاء المرحلة');
      },
    });
  }

  /**
   * فتح نموذج إضافة حزمة عمل
   */
  openWorkPackageForm(phaseId: string): void {
    this.selectedPhaseId = phaseId;
    this.workPackageForm = this.getEmptyWorkPackageForm();
    if (this.project) {
      this.workPackageForm.projectId = this.project.id;
    }
    this.workPackageForm.phaseId = phaseId;
    
    // توليد رقم حزمة العمل
    const phase = this.phases.find((p) => p.id === phaseId);
    if (phase) {
      const wpCount = phase.workPackages?.length || 0;
      this.workPackageForm.packageNumber = `WP-${phase.phaseNumber.toString().padStart(2, '0')}-${(wpCount + 1).toString().padStart(3, '0')}`;
    }
    
    this.showWorkPackageForm = true;
  }

  /**
   * إغلاق نموذج حزمة العمل
   */
  closeWorkPackageForm(): void {
    this.showWorkPackageForm = false;
    this.selectedPhaseId = null;
    this.workPackageForm = this.getEmptyWorkPackageForm();
  }

  /**
   * حفظ حزمة العمل
   */
  saveWorkPackage(): void {
    if (!this.validateWorkPackageForm()) {
      return;
    }

    this.wbsService.createWorkPackage(this.workPackageForm).subscribe({
      next: () => {
        this.closeWorkPackageForm();
        if (this.project) {
          this.loadPhases(this.project.id);
        }
      },
      error: (err: Error) => {
        console.error('Error creating work package:', err);
        alert('فشل في إنشاء حزمة العمل');
      },
    });
  }

  /**
   * حذف مرحلة
   */
  deletePhase(phase: Phase): void {
    if (!confirm(`هل أنت متأكد من حذف المرحلة "${phase.name}"؟`)) {
      return;
    }

    this.wbsService.deletePhase(phase.id).subscribe({
      next: () => {
        this.phases = this.phases.filter((p) => p.id !== phase.id);
        if (this.project) {
          this.loadPhases(this.project.id);
        }
      },
      error: (err: Error) => {
        console.error('Error deleting phase:', err);
        alert('فشل في حذف المرحلة');
      },
    });
  }

  /**
   * حذف حزمة عمل
   */
  deleteWorkPackage(wp: WorkPackage): void {
    if (!confirm(`هل أنت متأكد من حذف حزمة العمل "${wp.name}"؟`)) {
      return;
    }

    this.wbsService.deleteWorkPackage(wp.id).subscribe({
      next: () => {
        if (this.project) {
          this.loadPhases(this.project.id);
        }
      },
      error: (err: Error) => {
        console.error('Error deleting work package:', err);
        alert('فشل في حذف حزمة العمل');
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
   * حساب نسبة الإنجاز الكلية
   */
  get totalProgress(): number {
    if (this.phases.length === 0) {
      return 0;
    }
    const total = this.phases.reduce((sum, p) => sum + Number(p.progressPercent || 0), 0);
    return Math.round(total / this.phases.length);
  }

  /**
   * الحصول على نموذج مرحلة فارغ
   */
  private getEmptyPhaseForm(): CreatePhaseDto {
    return {
      projectId: '',
      phaseNumber: 1,
      name: '',
      description: '',
      allocatedBudget: undefined,
      plannedStartDate: '',
      plannedEndDate: '',
      status: 'pending',
      progressPercent: 0,
      sequenceOrder: 1,
    };
  }

  /**
   * الحصول على نموذج حزمة عمل فارغ
   */
  private getEmptyWorkPackageForm(): CreateWorkPackageDto {
    return {
      projectId: '',
      phaseId: '',
      packageNumber: '',
      name: '',
      description: '',
      estimatedCost: undefined,
      plannedStartDate: '',
      plannedEndDate: '',
      status: 'pending',
      progressPercent: 0,
    };
  }

  /**
   * التحقق من صحة نموذج المرحلة
   */
  private validatePhaseForm(): boolean {
    if (!this.phaseForm.name) {
      alert('يرجى إدخال اسم المرحلة');
      return false;
    }
    if (!this.phaseForm.plannedStartDate) {
      alert('يرجى إدخال تاريخ البدء المخطط');
      return false;
    }
    if (!this.phaseForm.plannedEndDate) {
      alert('يرجى إدخال تاريخ الانتهاء المخطط');
      return false;
    }
    return true;
  }

  /**
   * التحقق من صحة نموذج حزمة العمل
   */
  private validateWorkPackageForm(): boolean {
    if (!this.workPackageForm.name) {
      alert('يرجى إدخال اسم حزمة العمل');
      return false;
    }
    if (!this.workPackageForm.packageNumber) {
      alert('يرجى إدخال رقم حزمة العمل');
      return false;
    }
    if (!this.workPackageForm.plannedStartDate) {
      alert('يرجى إدخال تاريخ البدء المخطط');
      return false;
    }
    if (!this.workPackageForm.plannedEndDate) {
      alert('يرجى إدخال تاريخ الانتهاء المخطط');
      return false;
    }
    return true;
  }
}
