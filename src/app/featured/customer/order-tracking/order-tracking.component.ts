import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Order, OrderItem } from '../../../shared/models/order';
import { OrderServiceService } from '../../../core/services/order-service.service';
import { interval, Subscription, switchMap } from 'rxjs';
import { CustomerHeaderComponent } from '../../../shared/components/customer/customer-header/customer-header.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, CustomerHeaderComponent],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {

  orderId!: number;
  order!: Order;
  orderItems!: OrderItem[];
  loading = true;

  pollSub?: Subscription;
  sanitizedPaymentUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderServiceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!this.orderId || isNaN(this.orderId)) {
      this.router.navigate(['/']);
      return;
    }

    this.loadOrderDetails();
  }

  /** Load toàn bộ thông tin lần đầu */
  private loadOrderDetails(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (o) => {
        this.order = o;
        this.loading = false;

        this.updatePaymentUrl(o.paymentUrl);

        // Nếu đơn hàng đang chờ thanh toán → bật polling
        if (o.paymentStatus === 'PENDING') {
          this.startPolling();
        }
      },
      error: () => {
        this.loading = false;
      }
    });

    // load items
    this.orderService.getOrderItemById(this.orderId).subscribe({
      next: items => this.orderItems = items,
      error: err => console.error("Lỗi lấy items:", err)
    });
  }

  /** Bật polling */
  private startPolling(): void {
    this.pollSub = interval(5000)
      .pipe(
        switchMap(() => this.orderService.checkPaymentStatus(this.orderId))
      )
      .subscribe({
        next: (res) => {
          this.applyPaymentStatus(res.paymentStatus);
        },
        error: err => console.error("Polling error:", err)
      });
  }

  /** Áp dụng trạng thái thanh toán từ API */
  private applyPaymentStatus(paymentStatus: string): void {

    if (!this.order) return;

    if (paymentStatus === 'PAID') {
      this.order.paymentStatus = 'PAID';
      this.order.status = 'PROCESSING';

      this.stopPolling();
    }

    else if (paymentStatus === 'CANCELLED') {
      this.order.paymentStatus = 'CANCELLED';
      this.order.status = 'PENDING'; // hoặc PENDING tùy logic

      this.stopPolling();
    }

    else {
      // vẫn đang chờ
      this.order.paymentStatus = 'PENDING';
    }

    this.updatePaymentUrl(this.order.paymentUrl);
  }

  /** Dừng polling */
  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  /** Cập nhật iframe */
  private updatePaymentUrl(url: string | undefined): void {
    if (url && this.order.paymentStatus === 'PENDING') {
      this.sanitizedPaymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.sanitizedPaymentUrl = null;
    }
  }

  getProgress(status: string): number {
    switch (status) {
      case 'PENDING': return 25;
      case 'PROCESSING': return 50;
      case 'COMPLETED': return 75;
      case 'DELIVERED': return 100;
      default: return 0;
    }
  }

  getStepIcon(step: string, current: string): string {
    const order = ['PENDING', 'PROCESSING', 'COMPLETED', 'DELIVERED'];
    const stepIndex = order.indexOf(step);
    const currentIndex = order.indexOf(current);

    if (currentIndex > stepIndex) return 'bi-check-circle-fill text-success';
    if (currentIndex === stepIndex) return 'bi-circle-fill text-primary';
    return 'bi-circle text-secondary';
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
