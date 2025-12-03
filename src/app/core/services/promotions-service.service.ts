import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { promotions } from '../../shared/models/cart';
import { HttpClient } from '@angular/common/http';
import { Promotion } from '../../shared/models/promotion';

@Injectable({
  providedIn: 'root'
})
export class PromotionsServiceService {

  private baseUrl: string = "http://localhost:8000/promotions"

  constructor(private http: HttpClient) { }

  //lấy tất cả khuyến mãi 
  getAllPromo(): Observable<promotions[]> {
    return this.http.get<promotions[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    )
  }

  //lấy các khuyến mãi đang diễn ra 
  getCurrentPromo(): Observable<promotions[]> {
    return this.http.get<promotions[]>(this.baseUrl + '/current').pipe(
      catchError(this.handleError)
    )
  }

  //lấy khuyến mãi theo ID 
  getPromotionById(promotionId: number): Observable<promotions> {
    return this.http.get<promotions>(`${this.baseUrl}/byId/${promotionId}`).pipe(
      catchError(this.handleError)
    )
  }

  //cập nhật khuyến mãi
  updatePromotion(promo: promotions): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, promo).pipe(
      catchError(this.handleError)
    )
  }

  //thêm khuyến mãi mới 
  addPromotion(promo: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, promo).pipe(catchError(this.handleError))
  }

  //xoá khuyến mãi
  deletePromotion(promoId: number): Observable<any>{
    return this.http.delete(`${this.baseUrl}/delete/${promoId}`).pipe(catchError(this.handleError))
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
