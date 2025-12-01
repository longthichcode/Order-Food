import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { CartDTO } from '../../shared/models/cart';

@Injectable({
  providedIn: 'root'
})
export class CartServiceService {
  private baseUrl: string = "http://localhost:8000/cart";

  private cartCountSource = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSource.asObservable();

  constructor(private http: HttpClient) { }

  // Thêm món ăn vào giỏ hàng
  addToCart(userId: number, foodId: number, quantity: number, note: string): Observable<CartDTO> {
    let params = new HttpParams()
      .set('foodId', foodId.toString())
      .set('quantity', quantity.toString())
      .set('note', note || '');

    return this.http.post<CartDTO>(`${this.baseUrl}/${userId}/add`, {}, { params }).pipe(
      map((cart) => {
        this.updateCartCountFromCart(cart);
        return cart;
      }),
      catchError(this.handleError)
    );
  }

  // Lấy giỏ hàng hiện tại
  getCart(userId: number): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.baseUrl}/${userId}`).pipe(
      map((cart) => {
        this.updateCartCountFromCart(cart);
        return cart;
      }),
      catchError(this.handleError)
    );
  }

  updateCountCart(userId: number, foodId: number, quantity: number): Observable<CartDTO> {
    let params = new HttpParams()
      .set('foodId', foodId.toString())
      .set('quantity', quantity.toString());

    return this.http.put<CartDTO>(`${this.baseUrl}/${userId}/update`, {}, { params }).pipe(
      map((cart) => {
        this.updateCartCountFromCart(cart);
        return cart;
      }),
      catchError(this.handleError)
    );
  }

  updateNoteCart(userId: number, foodId: number, note: string): Observable<CartDTO> {
    let params = new HttpParams()
      .set('foodId', foodId.toString())
      .set('note', note);

    return this.http.put<CartDTO>(`${this.baseUrl}/${userId}/update-note`, {}, { params }).pipe(
      map((cart) => {
        this.updateCartCountFromCart(cart);
        return cart;
      }),
      catchError(this.handleError)
    );
  }

  deleteCartItem(userId: number, foodId: number) {
    return this.http.delete<CartDTO>(`${this.baseUrl}/${userId}/remove/${foodId}`).pipe(
      map((cart) => {
        this.updateCartCountFromCart(cart);
        return cart;
      }),
      catchError(this.handleError)
    );
  }

  applyPromotion(userId: number, promoCode: string): Observable<CartDTO> {
    const params = new HttpParams().set('promoCode', promoCode);
    return this.http.post<CartDTO>(`${this.baseUrl}/${userId}/apply-promotion`, {}, { params });
  }
  
  removePromotion(userId: number): Observable<CartDTO> {
    return this.http.delete<CartDTO>(`${this.baseUrl}/${userId}/remove-promotion`);
  }


  // ========== Cart Count ==========

  private updateCartCountFromCart(cart: CartDTO) {
    // Tính tổng quantity trong giỏ
    const totalItems = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.cartCountSource.next(totalItems);
  }

  setCartCount(count: number) {
    this.cartCountSource.next(count);
  }

  incrementCartCount(quantity: number = 1) {
    const current = this.cartCountSource.value;
    this.cartCountSource.next(current + quantity);
  }

  decrementCartCount(quantity: number = 1) {
    const current = this.cartCountSource.value;
    this.cartCountSource.next(Math.max(0, current - quantity));
  }

  // ========== Error handling ==========

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}