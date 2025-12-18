/**
 * نماذج تجزئة العمل (WBS)
 */

// نموذج المرحلة
export interface Phase {
  id: string;
  projectId: string;
  phaseNumber: number;
  name: string;
  description?: string;
  allocatedBudget?: number;
  spentAmount: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: PhaseStatus;
  progressPercent: number;
  sequenceOrder: number;
  dependsOnPhaseId?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  };
  workPackages?: WorkPackage[];
  dependsOn?: {
    id: string;
    phaseNumber: number;
    name: string;
  };
  _count?: {
    workPackages: number;
    expenses: number;
  };
}

// حالات المرحلة
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// نموذج حزمة العمل
export interface WorkPackage {
  id: string;
  phaseId: string;
  projectId: string;
  packageNumber: string;
  name: string;
  description?: string;
  scopeOfWork?: string;
  deliverables?: string;
  acceptanceCriteria?: string;
  estimatedCost?: number;
  contractedAmount?: number;
  actualCost: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  status: WorkPackageStatus;
  progressPercent: number;
  contractorId?: string;
  contractId?: string;
  supervisorId?: string;
  inspectorId?: string;
  inspectionDate?: string;
  inspectionResult?: string;
  inspectionNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  paymentOrderId?: string;
  createdAt: string;
  updatedAt: string;
  phase?: {
    id: string;
    phaseNumber: number;
    name: string;
  };
  project?: {
    id: string;
    projectNumber: string;
    name: string;
  };
  _count?: {
    materials: number;
    expenses: number;
  };
}

// حالات حزمة العمل
export type WorkPackageStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled'
  | 'inspection_pending'
  | 'inspection_passed'
  | 'inspection_failed';

// DTOs للإنشاء والتحديث
export interface CreatePhaseDto {
  projectId: string;
  phaseNumber: number;
  name: string;
  description?: string;
  allocatedBudget?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status?: PhaseStatus;
  progressPercent?: number;
  sequenceOrder?: number;
  dependsOnPhaseId?: string;
}

export interface UpdatePhaseDto {
  phaseNumber?: number;
  name?: string;
  description?: string;
  allocatedBudget?: number;
  spentAmount?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status?: PhaseStatus;
  progressPercent?: number;
  sequenceOrder?: number;
  dependsOnPhaseId?: string;
}

export interface CreateWorkPackageDto {
  projectId: string;
  phaseId: string;
  packageNumber: string;
  name: string;
  description?: string;
  scopeOfWork?: string;
  deliverables?: string;
  acceptanceCriteria?: string;
  estimatedCost?: number;
  contractedAmount?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  status?: WorkPackageStatus;
  progressPercent?: number;
  contractorId?: string;
  contractId?: string;
  supervisorId?: string;
}

export interface UpdateWorkPackageDto {
  phaseId?: string;
  packageNumber?: string;
  name?: string;
  description?: string;
  scopeOfWork?: string;
  deliverables?: string;
  acceptanceCriteria?: string;
  estimatedCost?: number;
  contractedAmount?: number;
  actualCost?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  status?: WorkPackageStatus;
  progressPercent?: number;
  contractorId?: string;
  contractId?: string;
  supervisorId?: string;
  inspectorId?: string;
  inspectionDate?: string;
  inspectionResult?: string;
  inspectionNotes?: string;
}

// إحصائيات المراحل
export interface PhaseStatistics {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
  budget: {
    totalAllocated: number;
    totalSpent: number;
  };
  averageProgress: number;
}

// إحصائيات حزم العمل
export interface WorkPackageStatistics {
  total: number;
  byStatus: Record<string, number>;
  cost: {
    totalEstimated: number;
    totalContracted: number;
    totalActual: number;
  };
  averageProgress: number;
}

// عنصر شجرة WBS
export interface WBSTreeNode {
  id: string;
  type: 'project' | 'phase' | 'work-package';
  name: string;
  number: string;
  status: string;
  progress: number;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  children?: WBSTreeNode[];
  expanded?: boolean;
  data?: Phase | WorkPackage;
}

// استجابة القائمة مع الترقيم
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
