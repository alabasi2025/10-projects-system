import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import {
  Project,
  ProjectType,
  ProjectStatus,
  CreateProjectDto,
  UpdateProjectDto,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  // حالة النموذج
  form!: FormGroup;
  isEditMode = signal(false);
  projectId = signal<string | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  // البيانات الأصلية للمشروع (في حالة التعديل)
  originalProject = signal<Project | null>(null);

  // القوائم المنسدلة
  typeOptions = Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({
    value: value as ProjectType,
    label,
  }));

  statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
    value: value as ProjectStatus,
    label,
  }));

  // العنوان الديناميكي
  pageTitle = computed(() =>
    this.isEditMode() ? 'تعديل المشروع' : 'إنشاء مشروع جديد'
  );

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  /**
   * تهيئة النموذج
   */
  private initForm(): void {
    this.form = this.fb.group({
      projectNumber: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      projectType: [ProjectType.OTHER, Validators.required],
      objectives: [''],
      scope: [''],
      deliverables: [''],
      estimatedBudget: [0, [Validators.required, Validators.min(0)]],
      approvedBudget: [null],
      currency: ['SAR'],
      plannedStartDate: ['', Validators.required],
      plannedEndDate: ['', Validators.required],
      actualStartDate: [''],
      actualEndDate: [''],
      durationDays: [null],
      status: [ProjectStatus.DRAFT],
      progressPercent: [0, [Validators.min(0), Validators.max(100)]],
      projectManagerId: [''],
      sponsorId: [''],
    });
  }

  /**
   * التحقق من وضع التعديل
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  /**
   * تحميل بيانات المشروع للتعديل
   */
  private loadProject(id: string): void {
    this.loading.set(true);
    this.projectsService.getProject(id).subscribe({
      next: (response) => {
        this.originalProject.set(response.data);
        this.patchFormWithProject(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  /**
   * ملء النموذج ببيانات المشروع
   */
  private patchFormWithProject(project: Project): void {
    this.form.patchValue({
      projectNumber: project.projectNumber,
      name: project.name,
      description: project.description || '',
      projectType: project.projectType,
      objectives: project.objectives || '',
      scope: project.scope || '',
      deliverables: project.deliverables || '',
      estimatedBudget: project.estimatedBudget,
      approvedBudget: project.approvedBudget,
      currency: project.currency,
      plannedStartDate: this.formatDateForInput(project.plannedStartDate),
      plannedEndDate: this.formatDateForInput(project.plannedEndDate),
      actualStartDate: project.actualStartDate
        ? this.formatDateForInput(project.actualStartDate)
        : '',
      actualEndDate: project.actualEndDate
        ? this.formatDateForInput(project.actualEndDate)
        : '',
      durationDays: project.durationDays,
      status: project.status,
      progressPercent: project.progressPercent,
      projectManagerId: project.projectManagerId || '',
      sponsorId: project.sponsorId || '',
    });
  }

  /**
   * تنسيق التاريخ لحقل الإدخال
   */
  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  /**
   * إرسال النموذج
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.form.value;

    // تحضير البيانات
    const projectData: CreateProjectDto | UpdateProjectDto = {
      projectNumber: formValue.projectNumber,
      name: formValue.name,
      description: formValue.description || undefined,
      projectType: formValue.projectType,
      objectives: formValue.objectives || undefined,
      scope: formValue.scope || undefined,
      deliverables: formValue.deliverables || undefined,
      estimatedBudget: Number(formValue.estimatedBudget),
      approvedBudget: formValue.approvedBudget
        ? Number(formValue.approvedBudget)
        : undefined,
      currency: formValue.currency,
      plannedStartDate: formValue.plannedStartDate,
      plannedEndDate: formValue.plannedEndDate,
      actualStartDate: formValue.actualStartDate || undefined,
      actualEndDate: formValue.actualEndDate || undefined,
      durationDays: formValue.durationDays || undefined,
      status: formValue.status,
      progressPercent: Number(formValue.progressPercent),
      projectManagerId: formValue.projectManagerId || undefined,
      sponsorId: formValue.sponsorId || undefined,
    };

    if (this.isEditMode() && this.projectId()) {
      // تحديث
      this.projectsService
        .updateProject(this.projectId()!, projectData)
        .subscribe({
          next: () => {
            this.router.navigate(['/projects']);
          },
          error: (err) => {
            this.error.set(err.message);
            this.submitting.set(false);
          },
        });
    } else {
      // إنشاء
      this.projectsService.createProject(projectData as CreateProjectDto).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.error.set(err.message);
          this.submitting.set(false);
        },
      });
    }
  }

  /**
   * تمييز جميع الحقول كـ touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * التحقق من صحة الحقل
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  /**
   * الحصول على رسالة الخطأ للحقل
   */
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'هذا الحقل مطلوب';
    if (field.errors['maxlength'])
      return `الحد الأقصى ${field.errors['maxlength'].requiredLength} حرف`;
    if (field.errors['min']) return `الحد الأدنى ${field.errors['min'].min}`;
    if (field.errors['max']) return `الحد الأقصى ${field.errors['max'].max}`;

    return 'قيمة غير صحيحة';
  }

  /**
   * إلغاء والعودة
   */
  onCancel(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * توليد رقم مشروع تلقائي
   */
  generateProjectNumber(): void {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.form.patchValue({
      projectNumber: `PROJ-${year}-${random}`,
    });
  }
}
