import { ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { UserServiceService } from '../../../core/services/user-service.service';
import { Role, User } from '../../../shared/models/user';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailRequest } from '../../../shared/models/email-request';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    AdminSideBarComponent,
    AdminHeaderComponent,
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    NgClass 
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  loading = false;
  errMessage = "";
  allUser: User[] = [];
  sidebarOpen = true;

  // bộ lọc sản phẩm
  searchTerm: string = '';
  selectedRole: string | null = null;
  selectedStatus: boolean | null = null;

  filteredUsers: any[] = [];

  // Dùng chung cho cả 3 modal
  selectedUser: User | null = null;
  newRole: Role = Role.CUSTOMER;

  constructor(
    private userService: UserServiceService,
    private snackBar: MatSnackBar
  ) { }

  private cDR = inject(ChangeDetectorRef)

  ngOnInit() {
    this.loadUsers(); // hàm load danh sách từ API
  }
  
  ngOnChanges() {
    this.applyFilter(); // nếu dùng OnPush
  }
  
  // Hàm chính: áp dụng tất cả bộ lọc
  applyFilter() {
    this.filteredUsers = this.allUser.filter(user => {
      // 1. Lọc theo từ khóa tìm kiếm
      const matchesSearch = !this.searchTerm || 
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phone?.includes(this.searchTerm);
  
      // 2. Lọc theo quyền
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
  
      // 3. Lọc theo trạng thái
      const matchesStatus = this.selectedStatus === null || user.status === this.selectedStatus;
  
      return matchesSearch && matchesRole && matchesStatus;
    });
  }
  
  // Reset toàn bộ bộ lọc
  resetFilters() {
    this.searchTerm = '';
    this.selectedRole = null;
    this.selectedStatus = null;
    this.applyFilter();
  }
  
  // Gọi lại sau khi load dữ liệu từ server
  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUser = users;
        this.applyFilter(); // ← quan trọng: cập nhật lại filteredUsers
      },
      error: (err) => {
        this.errMessage = 'Không tải được danh sách người dùng';
      }
    });
  }

  // Hàm này được gọi khi click bất kỳ nút hành động nào
  selectUser(user: User) {
    this.selectedUser = user;
    this.newRole = user.role || 'USER';   // reset lại khi mở modal phân quyền
  }

  showEmailForm: boolean = false;
  emailSubject: string = '';
  emailMessage: string = '';

  toggleEmailForm() {
    this.showEmailForm = !this.showEmailForm;
    console.log(this.selectedUser)
  }

  // Liên hệ
  sendEmail() {
    if (this.selectedUser?.email) {

      const senduser :EmailRequest = {
        to: this.selectedUser?.email,
        subject: this.emailSubject,
        body: this.emailMessage
      }

      this.userService.sendEmail(senduser).subscribe({
        next: (value) => {
          this.emailSubject='';
          this.emailMessage='';
          this.closeModal('contactModal');
          this.snackBar.open("Đã gửi mail !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success'],
            }
          )
        },
        error: (err) => {
          this.emailSubject='';
          this.emailMessage='';
          this.closeModal('contactModal');
          this.snackBar.open("Gửi mail thất bại !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error'],
            }
          ),
            console.log(err),
            console.log(senduser)
        }
      })
    }

  }

  callPhone() {
    if (this.selectedUser?.phone) {
      window.location.href = `tel:${this.selectedUser.phone}`;
    }
  }

  // Xoá
  confirmDisUser() {
    if (!this.selectedUser) return;
  
    this.userService.disableUserAccount(this.selectedUser.userId!).subscribe({
      next: () => {
        const user = this.allUser.find(u => u.userId === this.selectedUser!.userId);
        if (user) {
          user.status = false;  
        }
  
        this.closeModal('disUser');
        this.snackBar.open("Đã khoá tài khoản thành công!", "Đóng", {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['bg-success', 'text-white']
        });
      },
      error: (err) => {
        this.closeModal('disUser');
        this.snackBar.open("Khoá tài khoản thất bại!", "Đóng", {
          duration: 4000,
          panelClass: ['bg-danger', 'text-white']
        });
      }
    });
  }

  confirmUnblockUser() {
    if (!this.selectedUser) return;

    this.userService.undisableUserAccount(this.selectedUser.userId!).subscribe({
      next: () => {
        const user = this.allUser.find(u => u.userId === this.selectedUser!.userId);
        if (user) {
          user.status = true;  
        }

        this.closeModal('undisUser');
        this.snackBar.open("Đã mở vô hiệu hoá người dùng !!!", "Đóng",
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success'],
          }
        )
        this.cDR.detectChanges();
      },
      error: () => {
        this.closeModal('undisUser');
        this.snackBar.open("Mở vô hiệu hoá thất bại !!!", "Đóng",
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error'],
          }
        )
        this.cDR.detectChanges();
      }
    });
  }

  // Phân quyền
  saveRole() {
    if (!this.selectedUser || this.newRole === this.selectedUser.role) {
      this.closeModal('roleModal');
      return;
    }

    this.userService.updateUserRole(this.selectedUser.userId!, this.newRole).subscribe({
      next: () => {
        this.selectedUser!.role = this.newRole;
        this.closeModal('roleModal');
        this.snackBar.open("Cập nhật quyền thành công!", "Đóng", {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success']
        })
      },
      error: () => {
        this.snackBar.open("Cập nhật quyền thất bại!", "Đóng", {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error']
        })
      }
    });
  }

  // Đóng modal thủ công (vì không dùng NgbModal)
  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
  
    const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
    if (bsModal) bsModal.dispose();
  
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  
    const backdrop = document.querySelector('.modal-backdrop');
    backdrop?.remove();
  
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.removeAttribute('aria-modal');
    modal.setAttribute('aria-hidden', 'true');
  }
}