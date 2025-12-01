import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartServiceService } from '../../../core/services/cart-service.service';
import { CartDTO, CartItemDTO, promotions } from '../../../shared/models/cart';
import { OrderServiceService } from '../../../core/services/order-service.service';
// dùng Order API theo model mới, không cần CreateOrderRequest
import { Router } from '@angular/router';
import { CustomerHeaderComponent } from '../../../shared/components/customer/customer-header/customer-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionsServiceService } from '../../../core/services/promotions-service.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerHeaderComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  increaseQuantity(item: CartItemDTO) {
    const userId = Number(localStorage.getItem('id'));
    item.quantity++;

    this.cartService
      .updateCountCart(userId, item.foodId, item.quantity)
      .subscribe({
        next: (res) => {
          this.cartList = res; // đồng bộ lại cart
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tăng số lượng:', err);
          item.quantity--; // rollback nếu lỗi
        },
      });
  }

  decreaseQuantity(item: CartItemDTO) {
    if (item.quantity > 1) {
      const userId = Number(localStorage.getItem('id'));
      item.quantity--;

      this.cartService
        .updateCountCart(userId, item.foodId, item.quantity)
        .subscribe({
          next: (res) => {
            this.cartList = res; // đồng bộ lại cart
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Lỗi khi giảm số lượng:', err);
            item.quantity++; // rollback nếu lỗi
          },
        });
    }
  }

  loading = false;
  hasData = true;
  cartList!: CartDTO;
  Math: any;

  constructor(
    private cartService: CartServiceService,
    private promoService: PromotionsServiceService,
    private cdr: ChangeDetectorRef, // 👈 inject thêm
    private matBar: MatSnackBar,
    private orderService: OrderServiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllCart();
    this.getAllPromo();
  }

  promotions!: promotions[];
  getAllPromo() {
    this.promoService.getCurrentPromo().subscribe({
      next: (result) => {
        this.promotions = result;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  dropdownOpen = false;
  selectedPromotion: promotions | null = null;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectPromotion(promo: promotions) {
    this.selectedPromotion = promo;
    this.dropdownOpen = false; // ẩn danh sách sau khi chọn
  }

  getAllCart(): void {
    this.loading = true;
    const userId = Number(localStorage.getItem('id'));

    this.cartService.getCart(userId).subscribe({
      next: (res) => {
        this.cartList = res;
        this.hasData = !!res && res.cartItems?.length > 0;
        this.loading = false;
        console.log('Cart data:', this.cartList);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi load giỏ hàng:', err);
        this.hasData = false;
        this.loading = false;
        this.cdr.detectChanges(); // 👈 lỗi cũng phải cập nhật lại UI
      },
    });
  }

  // Xóa 1 item trong giỏ hàng
  removeItem(foodId: number): void {
    if (!this.cartList) return;
    const userId = Number(localStorage.getItem('id'));
    this.cartService.deleteCartItem(userId, foodId).subscribe({
      next: (cart) => {
        this.cartList = cart;
        this.matBar.open('Xoá thành công 1 món', 'Đóng', {
          duration: 3000,
        });
        this.cdr.detectChanges(); // render lại
      },
      error: (err) => {
        this.matBar.open('Xoá thất bại', 'Đóng', {
          duration: 3000,
        });
        console.log(err);
      },
    });
  }

  getSubtotal(): number {
    if (!this.cartList) return 0;
    return this.cartList.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
  }

  getFinalTotal(): number {
    if (!this.cartList) return 0;
    // totalPrice từ backend (đã trừ khuyến mãi nếu có)
    return this.cartList.totalPrice ?? this.getSubtotal();
  }

  getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    const finalTotal = this.getFinalTotal();
    return Math.max(0, subtotal - finalTotal);
  }

  //edit note
  editingNoteId: number | null = null; // lưu id món đang sửa
  selectedNote: string = ''; // nội dung note đang chỉnh

  startEditNote(item: CartItemDTO) {
    this.editingNoteId = item.cartItemId;
    this.selectedNote = item.note || '';
  }

  saveNote(item: CartItemDTO) {
    const userId = Number(localStorage.getItem('id'));
    item.note = this.selectedNote;
    this.editingNoteId = null;

    this.cartService.updateNoteCart(userId, item.foodId, item.note).subscribe({
      next: (res) => {
        this.cartList = res; // đồng bộ lại cart sau khi lưu
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi lưu ghi chú:', err);
      },
    });
  }

  cancelEdit() {
    this.editingNoteId = null;
  }

  // ========== Promotions ==========
  applySelectedPromotion() {
    if (!this.selectedPromotion) return;
    const userId = Number(localStorage.getItem('id'));
    this.cartService.applyPromotion(userId, this.selectedPromotion.code).subscribe({
      next: (res) => {
        this.cartList = res;
        this.matBar.open('Áp dụng khuyến mãi thành công', 'Đóng', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.matBar.open('Áp dụng khuyến mãi thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  removePromotion() {
    const userId = Number(localStorage.getItem('id'));
    this.cartService.removePromotion(userId).subscribe({
      next: (res) => {
        this.cartList = res;
        this.selectedPromotion = null;
        this.matBar.open('Đã hủy khuyến mãi', 'Đóng', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.matBar.open('Hủy khuyến mãi thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  // ========== Payment Methods ==========
  paymentMethods = [
    { code: 'CASH', name: 'Thanh toán tiền mặt', icon: 'bi-cash' },
    { code: 'PAYOS', name: 'Thanh toán thẻ', icon: 'bi-credit-card' },
    { code: 'MOMO', name: 'Ví MoMo', icon: 'bi-phone' }
  ];
  
  paymentDropdownOpen = false;
  selectedPaymentMethod: any = null;

  togglePaymentDropdown() {
    this.paymentDropdownOpen = !this.paymentDropdownOpen;
  }

  selectPaymentMethod(paymentMethod: any) {
    this.selectedPaymentMethod = paymentMethod;
    this.paymentMethod = paymentMethod.code;
    this.paymentDropdownOpen = false;
  }

  // ========== Place Order ==========
  customerName: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  paymentMethod: string = ''

  placeOrder() {
    if (!this.cartList) {
      this.matBar.open('Giỏ hàng trống', 'Đóng', { duration: 3000 });
      return;
    }
    if (!this.customerName || !this.customerPhone || !this.customerAddress) {
      this.matBar.open('Vui lòng nhập đầy đủ thông tin', 'Đóng', { duration: 3000 });
      return;
    }
    if (!this.paymentMethod) {
      this.matBar.open('Vui lòng chọn phương thức thanh toán', 'Đóng', { duration: 3000 });
      return;
    }

    const userId = Number(localStorage.getItem('id'));
    const req = {
      userId: userId,
      tableId: null,
      guestName: this.customerName,
      guestPhone: this.customerPhone,
      promoCode: this.cartList.promoCode || this.selectedPromotion?.code || null,
      address: this.customerAddress,
      paymentMethod: this.paymentMethod,
    };

    this.orderService.createOrder(req).subscribe({
      next: (order) => {
        this.matBar.open('Đặt hàng thành công', 'Đóng', { duration: 3000 });
        this.router.navigate(['/customer/orders', order.orderId]);
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err.error?.message || 'Đặt hàng thất bại';
        this.matBar.open(errorMessage, 'Đóng', { duration: 3000 });
      },
    });
  }
}
