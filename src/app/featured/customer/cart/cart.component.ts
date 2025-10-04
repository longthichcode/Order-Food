import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartServiceService } from '../../../core/services/cart-service.service';
import { CartDTO, CartItemDTO } from '../../../shared/models/cart';
import { CustomerHeaderComponent } from "../../../shared/components/customer/customer-header/customer-header.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerHeaderComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  increaseQuantity(item: CartItemDTO) {
    const userId = Number(localStorage.getItem('id'));
    item.quantity++;

    this.cartService.updateCountCart(userId, item.foodId, item.quantity).subscribe({
      next: (res) => {
        this.cartList = res; // đồng bộ lại cart
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tăng số lượng:', err);
        item.quantity--; // rollback nếu lỗi
      }
    });
  }

  decreaseQuantity(item: CartItemDTO) {
    if (item.quantity > 1) {
      const userId = Number(localStorage.getItem('id'));
      item.quantity--;

      this.cartService.updateCountCart(userId, item.foodId, item.quantity).subscribe({
        next: (res) => {
          this.cartList = res; // đồng bộ lại cart
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi giảm số lượng:', err);
          item.quantity++; // rollback nếu lỗi
        }
      });
    }
  }

  loading = false;
  hasData = true;
  cartList!: CartDTO;
  Math: any;

  constructor(
    private cartService: CartServiceService,
    private cdr: ChangeDetectorRef,   // 👈 inject thêm
    private matBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getAllCart();
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

        this.cdr.detectChanges(); // 👈 ép Angular cập nhật view ngay
      },
      error: (err) => {
        console.error('Lỗi khi load giỏ hàng:', err);
        this.hasData = false;
        this.loading = false;
        this.cdr.detectChanges(); // 👈 lỗi cũng phải cập nhật lại UI
      }
    });
  }

  // Xóa 1 item trong giỏ hàng
  removeItem(foodId: number): void {
    if (!this.cartList) return;
    const userId = Number(localStorage.getItem('id'));
    this.cartService.deleteCartItem(userId, foodId).subscribe({
      next: (cart) => {
        this.cartList = cart; 
        this.matBar.open("Xoá thành công 1 món", "Đóng" ,{
          duration:3000 
        });
        this.cdr.detectChanges(); // render lại
      },
      error: (err) => {
        this.matBar.open("Xoá thất bại", "Đóng" ,{
          duration:3000 
        });
        console.log(err)
      }
    });
  }

  getTotal(): number {
    if (!this.cartList) return 0;
    return this.cartList.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  //edit note 
  editingNoteId: number | null = null;   // lưu id món đang sửa
  selectedNote: string = '';             // nội dung note đang chỉnh

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
      }
    });
  }


  cancelEdit() {
    this.editingNoteId = null;
  }

}
