import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * معالجة الأخطاء
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';

    if (error.error instanceof ErrorEvent) {
      // خطأ من جانب العميل
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      // خطأ من جانب الخادم
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'بيانات غير صحيحة';
            break;
          case 401:
            errorMessage = 'غير مصرح لك بالوصول';
            break;
          case 403:
            errorMessage = 'ليس لديك صلاحية';
            break;
          case 404:
            errorMessage = 'العنصر غير موجود';
            break;
          case 409:
            errorMessage = 'تعارض في البيانات';
            break;
          case 500:
            errorMessage = 'خطأ في الخادم';
            break;
        }
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
