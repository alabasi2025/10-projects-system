import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Phase,
  WorkPackage,
  CreatePhaseDto,
  UpdatePhaseDto,
  CreateWorkPackageDto,
  UpdateWorkPackageDto,
  PhaseStatistics,
  WorkPackageStatistics,
  PaginatedResponse,
} from '../models/wbs.model';

@Injectable({
  providedIn: 'root',
})
export class WbsService {
  private http = inject(HttpClient);
  private phasesUrl = `${environment.apiUrl}/phases`;
  private workPackagesUrl = `${environment.apiUrl}/work-packages`;

  // ==================== المراحل (Phases) ====================

  /**
   * الحصول على قائمة المراحل
   */
  getPhases(params?: {
    projectId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Phase>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Phase>>(this.phasesUrl, { params: httpParams });
  }

  /**
   * الحصول على مراحل مشروع محدد مع الإحصائيات
   */
  getPhasesByProject(projectId: string): Observable<{ phases: Phase[]; statistics: PhaseStatistics }> {
    return this.http.get<{ phases: Phase[]; statistics: PhaseStatistics }>(`${this.phasesUrl}/project/${projectId}`);
  }

  /**
   * الحصول على مرحلة محددة
   */
  getPhase(id: string): Observable<{ success: boolean; data: Phase }> {
    return this.http.get<{ success: boolean; data: Phase }>(`${this.phasesUrl}/${id}`);
  }

  /**
   * إنشاء مرحلة جديدة
   */
  createPhase(phase: CreatePhaseDto): Observable<Phase> {
    return this.http.post<Phase>(this.phasesUrl, phase);
  }

  /**
   * تحديث مرحلة
   */
  updatePhase(id: string, phase: UpdatePhaseDto): Observable<{ success: boolean; data: Phase }> {
    return this.http.put<{ success: boolean; data: Phase }>(`${this.phasesUrl}/${id}`, phase);
  }

  /**
   * حذف مرحلة
   */
  deletePhase(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.phasesUrl}/${id}`);
  }

  /**
   * إحصائيات المراحل
   */
  getPhaseStatistics(projectId?: string): Observable<{ success: boolean; data: PhaseStatistics }> {
    let httpParams = new HttpParams();
    if (projectId) {
      httpParams = httpParams.set('projectId', projectId);
    }
    return this.http.get<{ success: boolean; data: PhaseStatistics }>(`${this.phasesUrl}/statistics`, { params: httpParams });
  }

  // ==================== حزم العمل (Work Packages) ====================

  /**
   * الحصول على قائمة حزم العمل
   */
  getWorkPackages(params?: {
    projectId?: string;
    phaseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<WorkPackage>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<WorkPackage>>(this.workPackagesUrl, { params: httpParams });
  }

  /**
   * الحصول على حزمة عمل محددة
   */
  getWorkPackage(id: string): Observable<{ success: boolean; data: WorkPackage }> {
    return this.http.get<{ success: boolean; data: WorkPackage }>(`${this.workPackagesUrl}/${id}`);
  }

  /**
   * إنشاء حزمة عمل جديدة
   */
  createWorkPackage(workPackage: CreateWorkPackageDto): Observable<WorkPackage> {
    return this.http.post<WorkPackage>(this.workPackagesUrl, workPackage);
  }

  /**
   * تحديث حزمة عمل
   */
  updateWorkPackage(id: string, workPackage: UpdateWorkPackageDto): Observable<{ success: boolean; data: WorkPackage }> {
    return this.http.put<{ success: boolean; data: WorkPackage }>(`${this.workPackagesUrl}/${id}`, workPackage);
  }

  /**
   * حذف حزمة عمل
   */
  deleteWorkPackage(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.workPackagesUrl}/${id}`);
  }

  /**
   * إحصائيات حزم العمل
   */
  getWorkPackageStatistics(params?: { projectId?: string; phaseId?: string }): Observable<{ success: boolean; data: WorkPackageStatistics }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ success: boolean; data: WorkPackageStatistics }>(`${this.workPackagesUrl}/statistics`, { params: httpParams });
  }

  // ==================== دوال مساعدة ====================

  /**
   * الحصول على لون الحالة
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      completed: '#28a745',
      on_hold: '#6c757d',
      cancelled: '#dc3545',
      inspection_pending: '#fd7e14',
      inspection_passed: '#20c997',
      inspection_failed: '#e83e8c',
      draft: '#6c757d',
    };
    return colors[status] || '#6c757d';
  }

  /**
   * الحصول على اسم الحالة
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      on_hold: 'معلق',
      cancelled: 'ملغي',
      inspection_pending: 'بانتظار الفحص',
      inspection_passed: 'اجتاز الفحص',
      inspection_failed: 'فشل الفحص',
      draft: 'مسودة',
    };
    return labels[status] || status;
  }
}
