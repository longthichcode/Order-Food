import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReviewServiceService } from '../../../core/services/review-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { CommonModule } from '@angular/common';
import { FoodReview } from '../../../shared/models/food';
import { User } from '../../../shared/models/user';
import { FormsModule } from '@angular/forms';
import { UserServiceService } from '../../../core/services/user-service.service';
import { EmailRequest } from '../../../shared/models/email-request';
import { error } from 'console';
@Component({
  selector: 'app-review',
  imports: [AdminHeaderComponent, AdminSideBarComponent, CommonModule, FormsModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  sidebarOpen: boolean = true;
  loading: boolean = false;

  constructor(
    private reviewService: ReviewServiceService,
    private snackBar: MatSnackBar
  ) { }

  private cDR = inject(ChangeDetectorRef)
  private userService = inject(UserServiceService)
  // Trong ngOnInit()
  ngOnInit() {
    this.loadReview();
  }

  allReviews: FoodReview[] = []

  // Thêm các biến này vào class
  filter = {
    username: '',
    foodName: '',
    fromDate: '',
    toDate: ''
  };
  sortRating: string = ''; // '', 'asc', 'desc'

  displayedReviews: FoodReview[] = [];

  // Trong ngOnInit hoặc sau khi load xong
  loadReview() {
    this.loading = true;
    this.reviewService.getAll().subscribe({
      next: (list) => {
        this.allReviews = list;
        this.displayedReviews = [...list];
        this.applyFilters(); // áp dụng lọc ngay lần đầu
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  // Hàm lọc + sắp xếp
  applyFilters() {
    let temp = [...this.allReviews];

    // Lọc username
    if (this.filter.username.trim()) {
      temp = temp.filter(r =>
        r.user.username.toLowerCase().includes(this.filter.username.toLowerCase().trim())
      );
    }

    // Lọc tên món
    if (this.filter.foodName.trim()) {
      temp = temp.filter(r =>
        r.food.name.toLowerCase().includes(this.filter.foodName.toLowerCase().trim())
      );
    }

    // Lọc ngày
    if (this.filter.fromDate) {
      const from = new Date(this.filter.fromDate);
      temp = temp.filter(r => new Date(r.createdAt) >= from);
    }
    if (this.filter.toDate) {
      const to = new Date(this.filter.toDate);
      to.setHours(23, 59, 59, 999);
      temp = temp.filter(r => new Date(r.createdAt) <= to);
    }

    // Sắp xếp theo sao
    if (this.sortRating === 'desc') {
      temp.sort((a, b) => b.rating - a.rating);
    } else if (this.sortRating === 'asc') {
      temp.sort((a, b) => a.rating - b.rating);
    } else {
      // Mặc định: mới nhất trước
      temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    this.displayedReviews = temp;
  }

  // Reset bộ lọc
  resetFilters() {
    this.filter = { username: '', foodName: '', fromDate: '', toDate: '' };
    this.sortRating = '';
    this.displayedReviews = [...this.allReviews];
  }

  hiddenReview(review: number): void {
    this.reviewService.hideReview(review).subscribe({
      next: (value) => {
        this.snackBar.open("Đã ẩn đánh giá !!!", "Đóng",
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success'],
          }
        )
        setTimeout(() => {
          this.loadReview(),
            3000
        })
        this.closeModal("hiddenModal")
      },
      error: (err) => {
        if (err.status == 200) {
          this.snackBar.open("Đã ẩn đánh giá !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success'],
            }
          )
          setTimeout(() => {
            this.loadReview(),
              3000
          })
          this.closeModal("hiddenModal")
        } else {
          console.log(err)
          this.snackBar.open("Lỗi ẩn đánh giá !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error'],
            }
          )
          setTimeout(() => {
            this.loadReview(),
              3000
          })
          this.closeModal("hiddenModal")
        }
      }
    })
  }

  showReview(review: number): void {
    this.reviewService.showReview(review).subscribe({
      next: (value) => {
        this.snackBar.open("Đã Hiện đánh giá !!!", "Đóng",
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success'],
          }
        )
        setTimeout(() => {
          this.loadReview(),
            3000
        })
        this.closeModal("showModal")
      },
      error: (err) => {
        if (err.status == 200) {
          this.snackBar.open("Đã hiện đánh giá !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success'],
            }
          )
          setTimeout(() => {
            this.loadReview(),
              3000
          })
          this.closeModal("showModal")
        } else {
          console.log(err)
          this.snackBar.open("Lỗi hiện đánh giá !!!", "Đóng",
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error'],
            }
          )
          setTimeout(() => {
            this.loadReview(),
              3000
          })
          this.closeModal("showModal")
        }
      }
    })
  }

  selectedReview: FoodReview | undefined

  selectReview(foodReview: FoodReview) {
    this.selectedReview = foodReview;
  }

  showEmailForm: boolean = false;
  emailSubject: string = '';
  emailMessage: string = '';
  toggleEmailForm() {
    this.showEmailForm = !this.showEmailForm;
    console.log(this.selectedReview?.user)
  }
  sendEmail() {
    if (this.selectedReview?.user.email) {

      const senduser: EmailRequest = {
        to: this.selectedReview?.user.email,
        subject: this.emailSubject,
        body: this.emailMessage
      }

      this.userService.sendEmail(senduser).subscribe({
        next: (value) => {
          this.emailSubject = '';
          this.emailMessage = '';
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
          this.emailSubject = '';
          this.emailMessage = '';
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

  // Đóng modal thủ công 
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