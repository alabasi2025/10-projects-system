import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  GanttData,
  CriticalPathResult,
  UpdateTaskDatesRequest,
  UpdateTaskProgressRequest,
} from '../models/gantt.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class GanttService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * الحصول على بيانات مخطط جانت لمشروع محدد
   */
  getGanttData(projectId: string): Observable<GanttData> {
    return this.http
      .get<ApiResponse<GanttData>>(`${this.baseUrl}/projects/${projectId}/gantt`)
      .pipe(map((response) => response.data));
  }

  /**
   * الحصول على المسار الحرج للمشروع
   */
  getCriticalPath(projectId: string): Observable<CriticalPathResult> {
    return this.http
      .get<ApiResponse<CriticalPathResult>>(
        `${this.baseUrl}/projects/${projectId}/gantt/critical-path`
      )
      .pipe(map((response) => response.data));
  }

  /**
   * تحديث تواريخ مهمة
   */
  updateTaskDates(
    projectId: string,
    taskId: string,
    data: UpdateTaskDatesRequest
  ): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/projects/${projectId}/gantt/tasks/${taskId}/dates`, data);
  }

  /**
   * تحديث نسبة التقدم
   */
  updateTaskProgress(
    projectId: string,
    taskId: string,
    data: UpdateTaskProgressRequest
  ): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/projects/${projectId}/gantt/tasks/${taskId}/progress`, data);
  }
}
