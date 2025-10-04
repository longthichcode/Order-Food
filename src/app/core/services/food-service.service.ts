import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Food } from '../../shared/models/food';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FoodServiceService {

  private baseUrl: string = 'http://localhost:8000/foods';

  constructor(private http: HttpClient) { }

  //lấy danh sách món ăn 
  getAllFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  //Lấy món nổi bật
  getPopularFood(): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/popular`)
      .pipe(
        catchError(this.handleError)
      );
  }

  //tìm món theo tên
  searchByName(name: string): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/by-name`, {
      params: { name }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // tìm món theo danh mục
  searchByCategory(categoryId: number): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/by-category`, {
      params: { categoryId }
    }).pipe(
      catchError(this.handleError)
    );
  }

  //tìm món theo mức giá 
  searchByCost(minPrice: number, maxPrice: number): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.baseUrl}/by-price`, {
      params: {
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  //xoá món 
  deleteFood(foodId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete`, {
      params: { foodId }
    }).pipe(
      catchError(this.handleError)
    )
  }

  //tìm món theo id 
  getById(foodId: number): Observable<Food> {
    return this.http.get<Food>(`${this.baseUrl}/by-id`, {
      params: { foodId }
    }).pipe(
      catchError(this.handleError)
    );
  }
  //sửa món ăn 
  updateFood(food: Food): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, food)
      .pipe(catchError(this.handleError));
  }
  //thêm món mới 
  addFood(food: Food): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, food)
      .pipe(catchError(this.handleError))
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
