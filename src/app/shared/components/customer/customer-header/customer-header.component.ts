import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service.service';
import { CartServiceService } from '../../../../core/services/cart-service.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

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

  cartCount$!: Observable<number>;
  constructor(
    private router: Router,
    private auth: AuthService,
    private cartService: CartServiceService
  ) {
    this.cartCount$ = this.cartService.cartCount$
   }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown() {
    this.open = !this.open;
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
    this.router.navigate(['/profile']);
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
}
