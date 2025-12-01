import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Role, User } from '../../../shared/models/user';
import { UserServiceService } from '../../../core/services/user-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailRequest } from '../../../shared/models/email-request';
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { PromotionsServiceService } from '../../../core/services/promotions-service.service';
import { Promotion } from '../../../shared/models/promotion';
import { promotions } from '../../../shared/models/cart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    this.loadPromotions(); // hàm load danh sách từ API
  }

  loadPromotions() {
    const status: string = 'Đang diễn ra';
    this.promotionService.getAllPromo().subscribe({
      next: (data) => {
        this.allPromo = data;
        this.cDR.detectChanges();
      },
      error: (error) => {
        this.errMessage = error.message;
      }
    })
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

  editForm = {
    promoId: 0,
    code: '',
    description: '',
    discountPercent: 0,
    startDate: '',
    endDate: '',
    isActive: true
  };

  openEditModal(promo: Promotion) {
    this.selectedPromo = { ...promo };

    this.editForm = {
      promoId: promo.promoId,
      code: promo.code,
      description: promo.description || '',
      discountPercent: promo.discountPercent ? Number(promo.discountPercent) : 0 ,
      startDate: this.formatDateForInput(promo.startDate),
      endDate: this.formatDateForInput(promo.endDate),
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

  saveChanges() {
    throw new Error('Method not implemented.');
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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