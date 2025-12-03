import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Role, User } from '../../../shared/models/user';
import { UserServiceService } from '../../../core/services/user-service.service';
import { EmailRequest } from '../../../shared/models/email-request';
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { PromotionsServiceService } from '../../../core/services/promotions-service.service';
import { Promotion } from '../../../shared/models/promotion';
import { promotions } from '../../../shared/models/cart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-promotion',
  imports: [AdminSideBarComponent, AdminHeaderComponent, CommonModule, FormsModule],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.css'
})
export class PromotionComponent implements OnInit {

  loading = false;
  errMessage = "";
  allPromo: Promotion[] = [];
  sidebarOpen = true;
  isOpenModalEdit: any;

  constructor(
    private promotionService: PromotionsServiceService,
    private snackBar: MatSnackBar
  ) { }

  private cDR = inject(ChangeDetectorRef)

  // Thêm thuộc tính lọc
  filter = {
    code: '',
    description: '',
    status: null as string | null,
    fromDate: '',
    toDate: ''
  };

  filteredPromo: Promotion[] = [];

  // Trong ngOnInit()
  ngOnInit() {
    this.loadPromotions();
  }

  // Sau khi load xong dữ liệu
  loadPromotions() {
    this.loading = true;
    this.promotionService.getAllPromo().subscribe({
      next: (data) => {
        this.allPromo = data;
        this.filteredPromo = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.errMessage = error.message || 'Lỗi tải dữ liệu';
        this.loading = false;
      }
    });
  }

  // Hàm lọc chính
  applyFilter() {
    this.filteredPromo = this.allPromo.filter(promo => {
      // Lọc mã
      if (this.filter.code && !promo.code.toLowerCase().includes(this.filter.code.toLowerCase())) {
        return false;
      }

      // Lọc mô tả
      if (this.filter.description &&
        !promo.description?.toLowerCase().includes(this.filter.description.toLowerCase())) {
        return false;
      }

      // Lọc trạng thái
      if (this.filter.status && this.getPromotionStatus(promo) !== this.filter.status) {
        return false;
      }

      // Lọc theo ngày bắt đầu
      if (this.filter.fromDate) {
        const promoDate = new Date(promo.startDate);
        const fromDate = new Date(this.filter.fromDate);
        if (promoDate < fromDate) return false;
      }

      // Lọc theo ngày kết thúc
      if (this.filter.toDate) {
        const promoDate = new Date(promo.endDate);
        const toDate = new Date(this.filter.toDate);
        toDate.setHours(23, 59, 59, 999); // đến hết ngày
        if (promoDate > toDate) return false;
      }

      return true;
    });
  }

  getPromotionStatus(promo: Promotion): string {
    if (!promo.endDate) return 'Không xác định';

    const endDate = new Date(promo.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return 'Đã hết hạn';
    } else if (promo.isActive === false) {
      return 'Tạm dừng';
    } else {
      return 'Đang diễn ra';
    }
  }

  getStatusClass(promo: Promotion): string {
    const status = this.getPromotionStatus(promo);
    if (status === 'Đang diễn ra') return 'status-active';
    if (status === 'Đã hết hạn') return 'status-expired';
    return 'status-paused';
  }

  selectedPromo: Promotion | null = null;
  isEditModalOpen = false;

  editForm: Promotion = {
    promoId: 0,
    code: '',
    description: '',
    discountPercent: 0,
    startDate: new Date,
    endDate: new Date,
    isActive: true
  };
  addForm = {
    promoId: null,
    code: '',
    description: '',
    discountPercent: 0,
    startDate: new Date,
    endDate: new Date,
    isActive: true
  };

  openEditModal(promo: Promotion) {
    this.selectedPromo = { ...promo };

    this.editForm = {
      promoId: promo.promoId,
      code: promo.code,
      description: promo.description || '',
      discountPercent: promo.discountPercent ? Number(promo.discountPercent) : 0,
      startDate: promo.startDate,
      endDate: promo.endDate,
      isActive: promo.isActive ?? true
    };

    this.isEditModalOpen = true;

    // Mở modal Bootstrap
    const modalElement = document.getElementById('editPromotionModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }

    console.log(this.editForm)
    this.cDR.detectChanges();
  }

  openAddModal() {
    //mở modal bootstrap 
    const modalElement = document.getElementById('addPromotionModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  addModal() {
    this.promotionService.addPromotion(this.addForm).subscribe({
      next: (data) => {
        this.addForm = {
          promoId: null,
          code: '',
          description: '',
          discountPercent: 0,
          startDate: new Date,
          endDate: new Date,
          isActive: true
        };
        this.snackBar.open("Thêm thành công !!!", "Đóng", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: [("success")]
        }),
          this.closeModal("addPromotionModal"),
          this.cDR.detectChanges();
        setTimeout(() => {
          this.loadPromotions();
        }, 3000);
      },
      error: (err) => {
        console.log(err),
          this.addForm = {
            promoId: null,
            code: '',
            description: '',
            discountPercent: 0,
            startDate: new Date,
            endDate: new Date,
            isActive: true
          };
        this.snackBar.open("Thêm thất bại !!!", "Đóng", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: [("error")]
        }),
          this.closeModal("addPromotionModal")
        this.cDR.detectChanges()
        setTimeout(() => {
          this.loadPromotions();
        }, 3000);
      }
    })
  }

  saveChanges() {
    this.promotionService.updatePromotion(this.editForm).subscribe({
      next: (data) => {
        console.log("ok"),
          this.editForm = {
            promoId: 0,
            code: '',
            description: '',
            discountPercent: 0,
            startDate: new Date,
            endDate: new Date,
            isActive: true
          };
        this.snackBar.open("Cập nhật thành công !!!", "Đóng", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: [("success")]
        }),
          this.closeModal("editPromotionModal"),
          this.cDR.detectChanges();
        setTimeout(() => {
          this.loadPromotions();
        }, 3000);
      },
      error: (err) => {
        console.log(err),
          this.editForm = {
            promoId: 0,
            code: '',
            description: '',
            discountPercent: 0,
            startDate: new Date,
            endDate: new Date,
            isActive: true
          };
        this.snackBar.open("Cập nhật thất bại !!!", "Đóng", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: [("error")]
        }),
          this.closeModal("editPromotionModal")
        this.cDR.detectChanges();
        setTimeout(() => {
          this.loadPromotions();
        }, 3000);
      }
    })
  }

  // Biến lưu khuyến mãi đang muốn xóa
  promoToDelete: Promotion | null = null;

  // Mở modal xác nhận xóa
  openDeleteModal(promo: Promotion) {
    this.promoToDelete = promo;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    modal.show();
  }

  // Xác nhận xóa
  confirmDelete() {
    if (this.promoToDelete) {
      this.promotionService.deletePromotion(this.promoToDelete?.promoId).subscribe({
        next: () => {
          this.promoToDelete = {
            promoId: 0,
            code: '',
            description: '',
            discountPercent: 0,
            startDate: new Date,
            endDate: new Date,
            isActive: true
          }
          this.snackBar.open("Xoá thành công !!!", "Đóng", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: [("success")]
          }),
            this.closeModal("deleteConfirmationModal"),
            this.cDR.detectChanges();
          setTimeout(() => {
            this.loadPromotions();
          }, 3000);
        },
        error: (err) => {
          console.log(err),
            this.promoToDelete = {
              promoId: 0,
              code: '',
              description: '',
              discountPercent: 0,
              startDate: new Date,
              endDate: new Date,
              isActive: true
            };
          this.snackBar.open("Xoá thất bại !!!", "Đóng", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: [("error")]
          }),
            this.closeModal("deleteConfirmationModal")
          this.cDR.detectChanges();
          setTimeout(() => {
            this.loadPromotions();
          }, 3000);
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