import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import {
  Project,
  ProjectStatus,
  ProjectType,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_COLORS,
  QueryProjectsParams,
} from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  // البيانات
  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // الإحصائيات
  statistics = signal<{
    totalProjects: number;
    byStatus: { draft: number; inProgress: number; completed: number };
    financial: { totalBudget: number; totalSpent: number };
  } | null>(null);

  // الترقيم
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  pageSize = signal(10);

  // الفلاتر
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | ''>('');
  selectedType = signal<ProjectType | ''>('');

  // القوائم المنسدلة
  statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
    value: value as ProjectStatus,
    label,
  }));

  typeOptions = Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({
    value: value as ProjectType,
    label,
  }));

  // الترجمات
  statusLabels = PROJECT_STATUS_LABELS;
  typeLabels = PROJECT_TYPE_LABELS;
  statusColors = PROJECT_STATUS_COLORS;

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadStatistics();
  }

  /**
   * تحميل قائمة المشاريع
   */
  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: QueryProjectsParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
    };

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }
    if (this.selectedStatus()) {
      params.status = this.selectedStatus() as ProjectStatus;
    }
    if (this.selectedType()) {
      params.projectType = this.selectedType() as ProjectType;
    }

    this.projectsService.getProjects(params).subscribe({
      next: (response) => {
        this.projects.set(response.data);
        this.totalPages.set(response.meta.totalPages);
        this.totalItems.set(response.meta.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  /**
   * تحميل الإحصائيات
   */
  loadStatistics(): void {
    this.projectsService.getStatistics().subscribe({
      next: (response) => {
        this.statistics.set(response.data);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      },
    });
  }

  /**
   * البحث
   */
  onSearch(): void {
    this.currentPage.set(1);
    this.loadProjects();
  }

  /**
   * تغيير الفلتر
   */
  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProjects();
  }

  /**
   * تغيير الصفحة
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProjects();
    }
  }

  /**
   * حذف مشروع
   */
  deleteProject(project: Project): void {
    if (confirm(`هل أنت متأكد من حذف المشروع "${project.name}"؟`)) {
      this.projectsService.deleteProject(project.id).subscribe({
        next: () => {
          this.loadProjects();
          this.loadStatistics();
        },
        error: (err) => {
          alert(err.message);
        },
      });
    }
  }

  /**
   * تنسيق المبلغ
   */
  formatCurrency(amount: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * تنسيق التاريخ
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * الحصول على لون الحالة
   */
  getStatusColor(status: ProjectStatus): string {
    return this.statusColors[status] || '#6b7280';
  }

  /**
   * الحصول على نسبة التقدم كنص
   */
  getProgressText(progress: number): string {
    return `${Math.round(progress)}%`;
  }
}
