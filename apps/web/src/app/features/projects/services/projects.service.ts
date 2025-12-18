import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Project,
  ProjectsResponse,
  ProjectResponse,
  ProjectStatistics,
  CreateProjectDto,
  UpdateProjectDto,
  QueryProjectsParams,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private endpoint = '/projects';

  constructor(private api: ApiService) {}

  /**
   * الحصول على قائمة المشاريع
   */
  getProjects(params?: QueryProjectsParams): Observable<ProjectsResponse> {
    return this.api.get<ProjectsResponse>(this.endpoint, params);
  }

  /**
   * الحصول على مشروع واحد
   */
  getProject(id: string): Observable<ProjectResponse> {
    return this.api.get<ProjectResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * إنشاء مشروع جديد
   */
  createProject(project: CreateProjectDto): Observable<ProjectResponse> {
    return this.api.post<ProjectResponse>(this.endpoint, project);
  }

  /**
   * تحديث مشروع
   */
  updateProject(id: string, project: UpdateProjectDto): Observable<ProjectResponse> {
    return this.api.put<ProjectResponse>(`${this.endpoint}/${id}`, project);
  }

  /**
   * حذف مشروع
   */
  deleteProject(id: string): Observable<ProjectResponse> {
    return this.api.delete<ProjectResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * الحصول على إحصائيات المشاريع
   */
  getStatistics(): Observable<ProjectStatistics> {
    return this.api.get<ProjectStatistics>(`${this.endpoint}/statistics`);
  }
}
