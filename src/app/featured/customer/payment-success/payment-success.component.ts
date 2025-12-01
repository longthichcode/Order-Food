import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderServiceService } from '../../../core/services/order-service.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderCode: number | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderServiceService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('orderCode');
    this.orderCode = code ? Number(code) : null;
    this.cdr.detectChanges;
  }

  tryAgain(): void {
    if (this.orderCode != null) {
      this.router.navigate(['/customer/orders', this.orderCode]);
    } else {
      this.router.navigate(['/customer/home']);
    }
  }

  goHome(): void {
    this.router.navigate(['/customer/home']);
  }
}