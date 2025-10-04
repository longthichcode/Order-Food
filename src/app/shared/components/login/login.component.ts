import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  activeTab: 'login' | 'register' = 'login'; // tab mặc định

  // Login form
  username: string = '';
  password: string = '';

  // Register form
  fullName: string = '';
  email: string = '';
  phone: string = '';
  regUsername: string = '';
  regPassword: string = '';

  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('API response:', res);

        const token = res.token || res.accessToken || res.jwt;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('username',res.username)
          localStorage.setItem('email',res.email)
          localStorage.setItem('role',res.role)
          localStorage.setItem('id',res.userId)
          this.router.navigate(['/']); // chuyển về trang chủ
        } else {
          this.errorMessage = 'Đăng nhập thất bại!';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'Sai tài khoản hoặc mật khẩu!';
      }
    });
  }

  onRegister() {
    if (!this.fullName || !this.email || !this.regUsername || !this.regPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin đăng ký!';
      return;
    }

    const newUser = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      username: this.regUsername,
      password: this.regPassword
    };

    console.log('Register Data:', newUser);

    this.authService.register(newUser).subscribe({
      next: (res) => {
        this.errorMessage = '';
        alert('Đăng ký thành công! Hãy đăng nhập.');
        this.activeTab = 'login'; // chuyển về tab đăng nhập
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Đăng ký thất bại!';
      }
    });
  }

}
