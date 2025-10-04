import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Food } from '../../shared/models/food';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../shared/models/user';
@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private baseUrl: string = 'http://localhost:8000/users';

  constructor(private http: HttpClient) { }

  //lấy danh sách người dùng 
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
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
