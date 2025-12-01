import { Component } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service.service';
import { CartServiceService } from '../../../../core/services/cart-service.service';
import { NotificationsServicesService } from '../../../../core/services/notifications-services.service';
import { Observable } from 'rxjs';
import { Notifications } from '../../../models/notifications';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './customer-header.component.html',
  styleUrl: './customer-header.component.css',
})
export class CustomerHeaderComponent {
  isMenuOpen = false;
  open = false;
  notificationsOpen = false;

  cartCount$!: Observable<number>;
  notifications$!: Observable<Notifications[]>;
  unreadNotificationsCount$!: Observable<number>;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cartService: CartServiceService,
    private notificationsService: NotificationsServicesService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
    const userId = Number(localStorage.getItem('id'));
    this.notifications$ = this.notificationsService.getAllNotifications(userId);
    this.unreadNotificationsCount$ = this.notificationsService.getUnreadNotificationsCount(userId);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown() {
    this.open = !this.open;
    this.notificationsOpen = false;
  }

  toggleNotificationsDropdown() {
    this.notificationsOpen = !this.notificationsOpen;
    this.open = false;
  }

  home(): void {
    this.isMenuOpen = false;
    this.router.navigate(['']);
  }

  menu(): void {
    this.isMenuOpen = false;
    this.router.navigate(['customer/menu']);
  }

  cart(): void {
    this.isMenuOpen = false;
    this.router.navigate(['customer/cart']);
  }

  viewProfile() {
    this.open = false;
    this.router.navigate(['customer/profile']);
  }

  goToAdmin() {
    this.open = false;
    this.router.navigate(['/admin']);
  }

  goToStaff() {
    this.open = false;
    this.router.navigate(['/staff']);
  }

  logout() {
    this.open = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  viewNotifications() {
    this.notificationsOpen = false;
    const userId = Number(localStorage.getItem('id'));
    this.notificationsService.deleteAllByUser(userId).subscribe({
      next: () => {
        this.notifications$ = this.notificationsService.getAllNotifications(userId);
        this.unreadNotificationsCount$ = this.notificationsService.getUnreadNotificationsCount(userId);
      },
      error: (err) => console.error('Error deleting all notifications:', err)
    });
  }

  viewNotificationDetail(orderId: number) {
    this.notificationsOpen = false;
    const userId = Number(localStorage.getItem('id'));
    this.router.navigate(['/customer/orders', orderId]);
  }

  deleteNoti(notificationId: number) {
    const userId = Number(localStorage.getItem('id'));
    this.notificationsService.deleteNoti(notificationId).subscribe({
      next: () => {
        this.notifications$ = this.notificationsService.getAllNotifications(userId);
        this.unreadNotificationsCount$ = this.notificationsService.getUnreadNotificationsCount(userId);
      },
      error: (err) => console.error('Error deleting notification:', err)
    });
  }

  readNotification(notificationId: number) {
    this.notificationsService.readNoti(notificationId).subscribe({
      next: () => {
        // Cập nhật lại danh sách thông báo sau khi đánh dấu đã đọc
        const userId = Number(localStorage.getItem('id'));
        this.notifications$ = this.notificationsService.getAllNotifications(userId);
        this.unreadNotificationsCount$ = this.notificationsService.getUnreadNotificationsCount(userId);
      },
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }
}