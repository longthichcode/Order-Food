import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.css']
})
export class PaymentCancelComponent implements OnInit {
  orderCode: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('orderCode');
    this.orderCode = code ? Number(code) : null;
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


