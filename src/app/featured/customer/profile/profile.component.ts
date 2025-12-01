import { Component, inject, OnInit } from '@angular/core';
import { CustomerHeaderComponent } from "../../../shared/components/customer/customer-header/customer-header.component";
import { User } from '../../../shared/models/user';
import { UserServiceService } from '../../../core/services/user-service.service';
import { CommonModule } from '@angular/common';
import { OrderServiceService } from '../../../core/services/order-service.service';
import { Order, OrderItem } from '../../../shared/models/order';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxPaginationModule } from "ngx-pagination";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';

// Thêm vào component
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgxPaginationModule, CustomerHeaderComponent, FormsModule, BaseChartDirective],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  myUser!: User;
  userId: number = Number(localStorage.getItem("id"));

  showMenu: string | null = null;
  activeForm: string = 'profile';
  showOld: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

  orders: any[] = [];
  originalOrders: any[] = [];
  searchQuery: string = '';

  // Bộ lọc
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterStatus: string = '';
  filterPaymentStatus: string = '';

  // Phân trang
  currentPage: number = 1;
  itemsPerPage: number = 6; // 6 đơn/trang → 2 dòng (3–4 card/dòng)
  totalItems: number = 0;

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private userService: UserServiceService,
    private orderService: OrderServiceService,
    private snackbar: MatSnackBar
  ) { }

  private router = inject(Router)

  ngOnInit(): void {
    this.loadUser(this.userId);
    this.loadOrdersWithItems(this.userId);
  }

  toggleMenu(menu: string) {
    this.showMenu = this.showMenu === menu ? null : menu;
  }

  // === LOAD USER ===
  loadUser(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (res) => {
        this.myUser = { ...res };
        console.log('User:', this.myUser);
      },
      error: (err) => {
        console.error('Lỗi load user:', err);
      }
    });
  }

  loadOrdersWithItems(userId: number): void {
    this.orderService.getOrdersByUserId(userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.originalOrders = [...orders];

        const orderItemRequests = orders.map(order =>
          this.orderService.getOrderItemById(order.orderId).pipe(
            catchError(err => {
              console.error(`Lỗi load items cho order ${order.orderId}:`, err);
              return of([]);
            })
          )
        );

        forkJoin(orderItemRequests).subscribe({
          next: (orderItemsArrays: any[][]) => {
            this.orders = this.orders.map((order, index) => ({
              ...order,
              orderItems: orderItemsArrays[index] || []
            }));
            this.originalOrders = [...this.orders];
            this.calculateStats();
            this.applyFilters(); // Áp dụng lọc lần đầu
          }
        });
      }
    });
  }

  // === LỌC + TÌM KIẾM ===
  applyFilters(): void {
    let filtered = [...this.originalOrders];

    // 1. Tìm kiếm tên hoặc số điện thoại
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.guestName?.toLowerCase().includes(query) ||
        order.guestPhone?.includes(query)
      );
    }

    // 2. Lọc theo ngày
    if (this.filterStartDate && this.filterEndDate) {
      const start = new Date(this.filterStartDate);
      const end = new Date(this.filterEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    // 3. Lọc trạng thái
    if (this.filterStatus) {
      filtered = filtered.filter(o => o.status === this.filterStatus);
    }

    // 4. Lọc thanh toán
    if (this.filterPaymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === this.filterPaymentStatus);
    }

    this.orders = filtered;
    this.calculateStats();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterStatus = '';
    this.filterPaymentStatus = '';
    this.orders = [...this.originalOrders];
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.filterStartDate ||
      this.filterEndDate ||
      this.filterStatus ||
      this.filterPaymentStatus
    );
  }

  // === NAV & FORMAT ===
  viewOrder(orderId: number) {
    this.router.navigate(['/customer/orders', orderId]);
  }

  onImgError(event: any) {
    event.target.src = 'assets/food_default.png';
  }

  formatStatus(status: string): string {
    const map: any = {
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang chuẩn bị',
      'COMPLETED': 'Hoàn tất',
      'DELIVERED': 'Đã giao'
    };
    return map[status] || status;
  }

  formatPaymentMethod(method: string): string {
    const map: any = { 'CASH': 'Tiền mặt', 'PAYOS': 'PayOS', 'MOMO': 'MoMo' };
    return map[method] || method;
  }

  formatPaymentStatus(status: string): string {
    const map: any = { 'PENDING': 'Chưa thanh toán', 'PAID': 'Đã thanh toán', 'CANCELLED': 'Đã hủy' };
    return map[status] || status;
  }

  cancelEdit() {
    window.location.reload();
  }

  // THAY ĐỔI THÔNG TIN NGƯỜI DÙNG VÀ MẬT KHẨU
  updateUserInf(user: User) {
    this.userService.updateUserInf(user).subscribe({
      next: (sc) => {
        console.log(user)
        this.snackbar.open("Cập nhật thông tin thành công !!", "Đóng", {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success']
        })
      },
      error: (err) => {
        console.log(err),
          this.snackbar.open("Cập nhật thông tin thất bại !!", "Đóng", {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error']
          })
      }
    })
  }

  changePassword() {
    // kiểm tra hợp lệ
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.snackbar.open("Vui lòng nhập đủ thông tin !!", "Đóng", {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error']
      })
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.snackbar.open("Mật khẩu xác nhận không khớp !!", "Đóng", {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error']
      })
      return;
    }
    const body = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword,
    };

    this.userService.updateUserPassword(this.myUser.userId, body).subscribe({
      next: (res) => {
        this.snackbar.open("Đổi mật khẩu thành công  !!", "Đóng", {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success']
        })
        this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
        this.activeForm = 'profile';
      },
      error: (err) => {
        console.error(err);
        this.snackbar.open("Đổi mật khẩu thất bại !!", "Đóng", {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error']
        })
      },
    });
  }








  // vẽ biểu đồ 
  // Biến thống kê
  stats = {
    totalOrders: 0,
    totalSpent: 0,
    favoriteFoods: [] as { name: string; count: number }[],
    ordersLast7Days: [] as { date: string; count: number }[],
    monthlySpending: [] as { month: string; amount: number }[]
  };

  // === BIỂU ĐỒ DATA ===
  favoriteFoodsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ordersLast7DaysChartData: ChartData<'line'> = { labels: [], datasets: [] };
  monthlySpendingChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieChartType: 'pie' = 'pie';

  // === OPTIONS ===

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Tỷ lệ món ăn đã đặt' },
      legend: { position: 'right' }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { title: { display: true, text: 'Đơn hàng 7 ngày gần đây' } },
    scales: { y: { beginAtZero: true } }
  };

  columnChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { title: { display: true, text: 'Chi tiêu theo tháng (₫)' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => new Intl.NumberFormat('vi-VN').format(Number(value)) + ' ₫'
        }
      }
    }
  };

  // === HÀM TÍNH THỐNG KÊ ===
  private calculateStats(): void {
    const orders = this.originalOrders;

    // 1. Tổng đơn + chi tiêu
    this.stats.totalOrders = orders.length;
    this.stats.totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    // 2. Top 5 món
    const foodMap: { [name: string]: number } = {};
    orders.forEach(o => {
      o.orderItems.forEach((i: any) => {
        const name = i.food.name;
        foodMap[name] = (foodMap[name] || 0) + 1;
      });
    });
    this.stats.favoriteFoods = Object.entries(foodMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. 7 ngày gần đây
    const last7 = Array(7).fill(0).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dayCount = last7.reduce((a, d) => ({ ...a, [d]: 0 }), {} as any);
    orders.forEach(o => {
      const d = o.createdAt.split('T')[0];
      if (dayCount[d] !== undefined) dayCount[d]++;
    });

    this.stats.ordersLast7Days = last7.map(d => ({
      date: new Date(d).toLocaleDateString('vi-VN', { weekday: 'short' }),
      count: dayCount[d]
    }));

    // 4. 12 tháng
    const monthMap: { [key: string]: number } = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
      monthMap[key] = 0;
    }
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
      if (monthMap[key] !== undefined) monthMap[key] += o.totalPrice;
    });
    this.stats.monthlySpending = Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));

    // === CẬP NHẬT BIỂU ĐỒ ===
    this.favoriteFoodsChartData = {
      labels: this.stats.favoriteFoods.map(f => f.name),
      datasets: [{
        data: this.stats.favoriteFoods.map(f => f.count),
        backgroundColor: '#ff6b6b',
        borderColor: '#ff6b6b',
        borderWidth: 1
      }]
    };

    this.ordersLast7DaysChartData = {
      labels: this.stats.ordersLast7Days.map(d => d.date),
      datasets: [{
        label: 'Số đơn',
        data: this.stats.ordersLast7Days.map(d => d.count),
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
        tension: 0.3
      }]
    };

    this.monthlySpendingChartData = {
      labels: this.stats.monthlySpending.map(m => m.month),
      datasets: [{
        label: 'Chi tiêu',
        data: this.stats.monthlySpending.map(m => m.amount),
        backgroundColor: '#1a535c'
      }]
    };

    const totalFoodCount = Object.values(foodMap).reduce((a, b) => a + b, 0);
    this.pieChartData = {
      labels: Object.keys(foodMap),
      datasets: [{
        data: Object.values(foodMap),
        backgroundColor: [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
          '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#1dd1a1'
        ],
        hoverOffset: 10
      }]
    };
  }
}