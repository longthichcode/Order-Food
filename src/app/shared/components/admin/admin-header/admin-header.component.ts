import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
  standalone: true
})
export class AdminHeaderComponent {
  open = false;

  constructor(private el: ElementRef, private router: Router, private auth: AuthService) {}

  toggleDropdown(event: Event) {
    event.stopPropagation(); // ngăn click bubble ra document
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // nếu click ngoài component thì đóng dropdown
    if (!this.el.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc() {
    this.open = false;
  }

  viewProfile() {
    this.open = false;
    this.router.navigate(['/profile']);
  }

  goToCustomer() {
    this.open = false;
    this.router.navigate(['/customer']);
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
