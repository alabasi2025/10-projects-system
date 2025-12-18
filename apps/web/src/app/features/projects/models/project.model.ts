/**
 * نموذج المشروع
 * Project Model
 */

export enum ProjectType {
  INFRASTRUCTURE = 'infrastructure',
  EXPANSION = 'expansion',
  MAINTENANCE = 'maintenance',
  MIGRATION = 'migration',
  SOLAR = 'solar',
  NETWORK = 'network',
  OTHER = 'other',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  objectives?: string;
  scope?: string;
  deliverables?: string;
  estimatedBudget: number;
  approvedBudget?: number;
  currency: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  status: ProjectStatus;
  progressPercent: number;
  projectManagerId?: string;
  sponsorId?: string;
  approvedBy?: string;
  approvedAt?: string;
  attachments: any[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  phases?: ProjectPhase[];
  budgets?: ProjectBudget[];
  _count?: {
    phases: number;
    workPackages: number;
    expenses: number;
  };
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: string;
  progressPercent: number;
}

export interface ProjectBudget {
  id: string;
  budgetVersion: number;
  originalBudget: number;
  currentBudget: number;
  spentAmount: number;
}

export interface CreateProjectDto {
  projectNumber: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  objectives?: string;
  scope?: string;
  deliverables?: string;
  estimatedBudget: number;
  approvedBudget?: number;
  currency?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  status?: ProjectStatus;
  progressPercent?: number;
  projectManagerId?: string;
  sponsorId?: string;
  attachments?: any[];
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}

export interface ProjectStatistics {
  success: boolean;
  data: {
    totalProjects: number;
    byStatus: {
      draft: number;
      inProgress: number;
      completed: number;
    };
    financial: {
      totalBudget: number;
      totalSpent: number;
    };
  };
}

export interface QueryProjectsParams {
  search?: string;
  status?: ProjectStatus;
  projectType?: ProjectType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// خريطة ترجمة أنواع المشاريع
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  [ProjectType.INFRASTRUCTURE]: 'بنية تحتية',
  [ProjectType.EXPANSION]: 'توسعة',
  [ProjectType.MAINTENANCE]: 'صيانة كبرى',
  [ProjectType.MIGRATION]: 'ترحيل',
  [ProjectType.SOLAR]: 'طاقة شمسية',
  [ProjectType.NETWORK]: 'شبكات',
  [ProjectType.OTHER]: 'أخرى',
};

// خريطة ترجمة حالات المشاريع
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'مسودة',
  [ProjectStatus.PENDING_APPROVAL]: 'بانتظار الموافقة',
  [ProjectStatus.APPROVED]: 'معتمد',
  [ProjectStatus.IN_PROGRESS]: 'قيد التنفيذ',
  [ProjectStatus.ON_HOLD]: 'متوقف',
  [ProjectStatus.COMPLETED]: 'مكتمل',
  [ProjectStatus.CANCELLED]: 'ملغي',
};

// ألوان حالات المشاريع
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: '#6b7280',
  [ProjectStatus.PENDING_APPROVAL]: '#f59e0b',
  [ProjectStatus.APPROVED]: '#3b82f6',
  [ProjectStatus.IN_PROGRESS]: '#10b981',
  [ProjectStatus.ON_HOLD]: '#ef4444',
  [ProjectStatus.COMPLETED]: '#059669',
  [ProjectStatus.CANCELLED]: '#dc2626',
};
