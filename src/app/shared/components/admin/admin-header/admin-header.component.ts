import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  imports: [],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit{
  ngOnInit(): void {
  }

  logout() {
  // Thực hiện đăng xuất, ví dụ chuyển về trang đăng nhập
  window.location.href = '/login';
}
}
