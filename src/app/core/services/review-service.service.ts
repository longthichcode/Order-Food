import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Food, FoodReview } from '../../shared/models/food';

@Injectable({
  providedIn: 'root'
})
export class ReviewServiceService {
  private baseUrl: string = 'http://localhost:8000/reviews';

  constructor(private http: HttpClient) { }

  //lấy tất cả đánh giá
  getAll(): Observable<FoodReview[]>{
    return this.http.get<FoodReview[]>(`${this.baseUrl}`)
  }
  //lấy review theo món ăn 
  getReviewByFoodId(foodId:number): Observable<FoodReview[]>{
    return this.http.get<FoodReview[]>(`${this.baseUrl}/food/${foodId}`)
  }
  // viết đánh giá 
  writeReview(foodId:number ,userId:number ,reviewReq:{rating:number, comment:string }) :Observable<any>{
    return this.http.post(`${this.baseUrl}/food/${foodId}/user/${userId}`,reviewReq)
  }
  //sửa đánh giá 
  editMyReview(reviewId: number , userId: number ,reviewReq:{rating:number, comment:string } ):Observable<any>{
    return this.http.put(`${this.baseUrl}/${reviewId}/user/${userId}`,reviewReq)
  }
  //xoá đánh giá 
  deleteMyReview(reviewId: number , userId: number) :Observable<any> {
    return this.http.delete(`${this.baseUrl}/${reviewId}/user/${userId}`)
  }
  //ẩn đánh giá 
  hideReview(reviewId: number){
    return this.http.put(`${this.baseUrl}/hide/${reviewId}`,{})
  }
  //hiện đánh giá
  showReview(reviewId: number){
    return this.http.put(`${this.baseUrl}/show/${reviewId}`,{})
  }
}
