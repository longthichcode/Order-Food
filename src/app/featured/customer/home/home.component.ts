import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodServiceService } from '../../../core/services/food-service.service';
import { CartServiceService } from '../../../core/services/cart-service.service';
import { Food } from '../../../shared/models/food';
import { CustomerHeaderComponent } from "../../../shared/components/customer/customer-header/customer-header.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CustomerHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(
    private foodService: FoodServiceService,
    private cartService: CartServiceService,
    private router : Router
  ) {}

  // state chính
  loading: boolean = false;
  messageErr!: string;
  popularFoods!: Food[];
  bgImage = 'assets/food_bg.jpg';

  // quản lý form thêm vào giỏ
  selectedFoodId: number | null = null;
  quantity: number = 1;
  note: string = '';

  ngOnInit(): void {
    this.getPopularFood();
  }

  // Lấy danh sách món ăn nổi bật
  getPopularFood(): void {
    this.loading = true;
    this.foodService.getPopularFood().subscribe({
      next: (food) => {
        this.popularFoods = food;
        this.loading = false;
      },
      error: (err) => {
        this.messageErr = 'Không thể tải món ăn nổi bật. Vui lòng thử lại!';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Bật/tắt form nhập số lượng và lưu ý
  toggleCartForm(foodId: number): void {
    if (this.selectedFoodId === foodId) {
      this.selectedFoodId = null; // click lại thì đóng
    } else {
      this.selectedFoodId = foodId;
      this.quantity = 1;
      this.note = '';
    }
  }

  // Gửi dữ liệu thêm vào giỏ hàng
  addToCart(foodId: number, quantity: number, note: string): void {
    this.loading = true;
    this.cartService.addToCart(Number(localStorage.getItem('id')),foodId, quantity, note).subscribe({
      next: () => {
        this.loading = false;
        this.selectedFoodId = null; // ẩn form sau khi thêm
        alert('Đã thêm vào giỏ hàng!');
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Có lỗi khi thêm vào giỏ hàng!');
      }
    });
  }

  menu():void{
    this.router.navigate(['customer/menu']);
  }
}
