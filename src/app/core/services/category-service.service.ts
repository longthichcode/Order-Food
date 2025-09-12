import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Category } from '../../shared/models/food';

@Injectable({
  providedIn: 'root'
})
export class CategoryServiceService {

  constructor(private http: HttpClient) { }

  private baseUrl = "http://localhost:8000/categories";

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  // thêm danh mục
  addCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, category).pipe(catchError(this.handleError));
  }

  // sửa danh mục 
  updateCategory(category: Category): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, category).pipe(catchError(this.handleError));
  }

  //Xoá danh mục
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete`, { params: { id } }).pipe(catchError(this.handleError))
  }

  //xử lý lỗi
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
