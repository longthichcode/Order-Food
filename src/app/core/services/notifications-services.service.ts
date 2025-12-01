import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notifications } from '../../shared/models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsServicesService {
  private baseUrl: string = 'http://localhost:8000/notifications';
  constructor(private http: HttpClient) { }

  getAllNotifications(userId: number): Observable<Notifications[]> {
    return this.http.get<Notifications[]>(`${this.baseUrl}/user/${userId}`);
  }

  getUnreadNotificationsCount(userId: number): Observable<number> {
    return this.getAllNotifications(userId).pipe(
      map(notifications => notifications.filter(notification => notification.status === 'UNREAD').length)
    );
  }

  // Xóa tất cả thông báo của người dùng
  deleteAllByUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/user/${userId}`);
  }

  // Xóa một thông báo
  deleteNoti(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${notificationId}`);
  }

  // Đánh dấu thông báo là đã đọc
  readNoti(notificationId: number): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/read/${notificationId}`);
  }
}