import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Food } from '../../shared/models/food';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Role, User } from '../../shared/models/user';
import { EmailRequest } from '../../shared/models/email-request';
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

  // lấy người dùng theo id 
  getUserById(userId: number):Observable<User>{
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(catchError(this.handleError))
  }

  //cập nhật thông tin người dùng 
  updateUserInf(user: User): Observable<User>{
    return this.http.put(`${this.baseUrl}/${user.userId}`,user) as Observable<User>
  }

  //cập nhật mật khẩu
  updateUserPassword(id: number, data: { oldPassword: string, newPassword: string }) {
    return this.http.put(`${this.baseUrl}/password/${id}`, data);
  }  

  //vô hiệu hoá tài khoản 
  disableUserAccount(userID : number):Observable<any>{
    return this.http.put(`${this.baseUrl}/dis/${userID}`,{}) ;
  }

  //mở khoá tài khoản 
  undisableUserAccount(userID: number): Observable<any>{
    return this.http.put(`${this.baseUrl}/undis/${userID}`,{})
  }

  //sửa vai trò người dùng
  updateUserRole(userID: number, role: Role): Observable<any>{
    return this.http.put(`${this.baseUrl}/${userID}/role`,{role});
  }

  //liên hệ : contact 
  sendEmail(EmailRequest: EmailRequest): Observable<any>{
    return this.http.post('http://localhost:8000/contact/send',EmailRequest);
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
