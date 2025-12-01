import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderItem } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {

  private baseUrl: string = 'http://localhost:8000/orders';

  constructor(private http: HttpClient) {}

  //lấy tất cả đơn hàng 
  getAll():Observable<Order[]>{
    return this.http.get<Order[]>(this.baseUrl)
  }
  //tạo đơn hàng
  createOrder(req: any): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/create`, req);
  }
  //hoàn tất thanh toán
  completeOrder(orderId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/complete/${orderId}`, {});
  }
  //lấy đơn hàng theo Id
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }
  //lấy tất cả món 
  getOrderItemById(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/${orderId}/items`);
  }
  //thay đổi trạng thái đơn hàng 
  changeStatus(orderId:number , status:string):Observable<any>{
    return this.http.put<any>(`${this.baseUrl}/${orderId}/status`, { status });
  }
  
  //lọc đơn hàng theo khoảng ngày
  filterOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/filter?start=${startDate}&end=${endDate}`);
  }

  // Xử lý payment success từ PayOS
  handlePaymentSuccess(orderCode: number): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/payment/success?orderCode=${orderCode}`);
  }

  // Xử lý payment cancel từ PayOS
  handlePaymentCancel(orderCode: number): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/payment/cancel?orderCode=${orderCode}`);
  }
  //kiểm tra trạng thái thanh toán
  checkPaymentStatus(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${orderId}/payment/status`, {});
  }

  // lấy đơn hàng theo user id
  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`);
  }
  
}


