import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FoodServiceService } from '../../../core/services/food-service.service';
import { CategoryServiceService } from '../../../core/services/category-service.service';
import { CartServiceService } from '../../../core/services/cart-service.service';
import { Food, Category } from '../../../shared/models/food';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { CustomerHeaderComponent } from '../../../shared/components/customer/customer-header/customer-header.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    CustomerHeaderComponent
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  
  constructor(
    private foodService: FoodServiceService,
    private cartService: CartServiceService,
    private categoryService: CategoryServiceService,
    private snackBar: MatSnackBar
  ) { }

  // Quản lý form thêm vào giỏ
  selectedFoodId: number | null = null;
  quantity: number = 1;
  note: string = '';

  totalItems: number | undefined;
  loading: boolean = false;
  messageErr: string = '';
  popularFoods: Food[] = [];
  allFoods: Food[] = []; // Danh sách hiển thị
  originalFoods: Food[] = []; // Dữ liệu gốc
  listCategory: Category[] = [];
  selectedCategory: number = 0;
  filterPrice: string = ''; // Lọc giá: 'low', 'mid', 'high'

  // Debounce tìm kiếm
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.getAllFood();
    this.getPopularFood();
    this.getAllCategories();

    // Debounce tìm kiếm theo tên
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchName => {
      this.applyFilters(searchName);
    });
  }

  /** Lấy tất cả món ăn */
  getAllFood(): void {
    this.loading = true;
    this.messageErr = '';
    this.foodService.getAllFoods().subscribe({
      next: (food) => {
        this.allFoods = food;
        this.originalFoods = food; // Lưu dữ liệu gốc
        this.totalItems = food.length;
        this.loading = false;
        this.applyFilters(); // Áp dụng bộ lọc ngay sau khi tải
        this.snackBar.open('Đã tải danh sách món ăn!', 'Đóng', { duration: 2000 });
      },
      error: (err) => {
        this.messageErr = 'Không thể tải tất cả món ăn. Vui lòng thử lại!';
        this.snackBar.open(this.messageErr, 'Đóng', { duration: 3000 });
        console.error(err);
        this.loading = false;
      }
    });
  }

  /** Lấy món ăn nổi bật */
  getPopularFood(): void {
    this.foodService.getPopularFood().subscribe({
      next: (food) => {
        this.popularFoods = food;
      },
      error: (err) => {
        this.messageErr = 'Không thể tải món ăn nổi bật. Vui lòng thử lại!';
        this.snackBar.open(this.messageErr, 'Đóng', { duration: 3000 });
        console.error(err);
      }
    });
  }

  /** Lấy danh sách danh mục */
  getAllCategories(): void {
    this.loading = true;
    this.messageErr = '';
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.listCategory = categories;
        this.loading = false;
      },
      error: (err) => {
        this.messageErr = 'Không thể tải danh sách danh mục. Vui lòng thử lại!';
        this.snackBar.open(this.messageErr, 'Đóng', { duration: 3000 });
        console.error(err);
        this.loading = false;
      }
    });
  }

  /** Tìm kiếm theo tên */
  searchByName(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchSubject.next(value);
  }

  /** Lọc theo danh mục */
  filterByCategory(categoryId: number): void {
    if(categoryId!=0){
      this.selectedCategory = categoryId;
      this.applyFilters();
    }
    else{
      this.getAllFood();
    }
  }

  /** Áp dụng tất cả bộ lọc (tên, danh mục, giá) */
  applyFilters(searchName: string = ''): void {
    this.loading = true;
    let filteredFoods = [...this.originalFoods];

    // Lọc theo tên
    if (searchName) {
      filteredFoods = filteredFoods.filter(f => f.name.toLowerCase().includes(searchName));
    }

    // Lọc theo danh mục
    if (this.selectedCategory !== 0) {
      filteredFoods = filteredFoods.filter(f => f.category?.categoryId === this.selectedCategory);
    }

    // Lọc theo mức giá
    if (this.filterPrice) {
      switch (this.filterPrice) {
        case 'low':
          filteredFoods = filteredFoods.filter(f => f.price < 30000);
          break;
        case 'mid':
          filteredFoods = filteredFoods.filter(f => f.price >= 30000 && f.price <= 70000);
          break;
        case 'high':
          filteredFoods = filteredFoods.filter(f => f.price > 70000);
          break;
      }
    }

    this.allFoods = filteredFoods;
    this.loading = false;
  }

  /** Thêm vào giỏ hàng */
  addToCart(foodId: number, quantity: number, note: string): void {
    this.loading = true;
    this.cartService.addToCart(Number(localStorage.getItem('id')), foodId, quantity, note).subscribe({
      next: () => {
        this.loading = false;
        this.selectedFoodId = null;
        this.snackBar.open('Đã thêm vào giỏ hàng!', 'Đóng', { duration: 2000 });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.snackBar.open('Có lỗi khi thêm vào giỏ hàng!', 'Đóng', { duration: 3000 });
      }
    });
  }

  /** Chuyển đổi form thêm vào giỏ */
  toggleCartForm(foodId: number): void {
    if (this.selectedFoodId === foodId) {
      this.selectedFoodId = null;
    } else {
      this.selectedFoodId = foodId;
      this.quantity = 1;
      this.note = '';
    }
  }

  /** Format tiền VND */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}