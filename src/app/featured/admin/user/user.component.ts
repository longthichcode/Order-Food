import { Component, OnInit } from '@angular/core';
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { UserServiceService } from '../../../core/services/user-service.service';
import { User } from '../../../shared/models/user';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AdminSideBarComponent, AdminHeaderComponent, NgIf, NgFor, DatePipe], // ✅ thêm DatePipe
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(private userService: UserServiceService) {}

  loading: boolean = false;
  errMessage: string = "";
  allUser: User[] = [];

  ngOnInit(): void {
    this.getAllUser();
  }

  getAllUser(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUser = data;
        this.loading = false;
      },
      error: (err) => {
        this.errMessage = "Không thể tải danh sách người dùng!";
        console.error(err);
        this.loading = false;
      }
    });
  }

  sidebarOpen: boolean = true;
}
