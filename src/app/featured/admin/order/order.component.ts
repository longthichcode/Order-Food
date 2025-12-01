import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";
import { OrderServiceService } from '../../../core/services/order-service.service';
import { Order } from '../../../shared/models/order';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-order',
  imports: [AdminHeaderComponent, AdminSideBarComponent, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  Math: any;

  constructor(
    private orderService: OrderServiceService,
    private matBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  sidebarOpen: boolean = true;
  allOrder!: Order[];
  loading: boolean = false;
  page: number = 1;
  pageSize: number = 5;
  selectedOrder: Order | null = null;
  selectedItems: any[] = [];
  showModal: boolean = false;

  // Thống kê
  totalOrders: number = 0;
  pendingCount: number = 0;        // Chờ xác nhận
  processingCount: number = 0;     // Đang chuẩn bị/Đang xử lý
  revenuePaid: number = 0;         // Doanh thu (đơn đã thanh toán)
  unpaidCount: number = 0;         // Chưa thanh toán
  totalAmount: number = 0;         // Tổng cộng (tất cả đơn)

  // Biến lọc
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterStatus: string = '';
  filterPaymentStatus: string = '';
  isFiltered: boolean = false;
  originalOrders: Order[] = []; // Lưu trữ dữ liệu gốc

  ngOnInit(): void {
    this.getAllOrder();
  }

  getAllOrder(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (list) => {
        this.allOrder = list;
        this.originalOrders = [...list]; // Lưu trữ dữ liệu gốc
        this.updateStats();
        this.loading = false;
        this.matBar.open('Tải đơn hàng thành công !!', 'Đóng', { duration: 2000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.matBar.open('Tải đơn hàng thất bại !!', 'Đóng', { duration: 2000 });
        console.error(err);
      }
    });
  }

  private updateStats(): void {
    const orders = this.allOrder || [];
    this.totalOrders = orders.length;
    this.pendingCount = orders.filter(o => o.status === 'PENDING').length;
    this.processingCount = orders.filter(o => o.status === 'PROCESSING').length;
    this.revenuePaid = orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    this.unpaidCount = orders.filter(o => o.paymentStatus === 'PENDING').length;
    this.totalAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }

  onStatusChange(order: Order, newStatus: string): void {
    const validStatuses: Array<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED'> =
      ['PENDING', 'PROCESSING', 'COMPLETED', 'DELIVERED'];

    if (!validStatuses.includes(newStatus as any)) {
      this.matBar.open('Trạng thái không hợp lệ!', 'Đóng', { duration: 2000 });
      return;
    }

    if (order.status === newStatus) {
      return;
    }

    this.orderService.changeStatus(order.orderId, newStatus).subscribe({
      next: () => {
        order.status = newStatus as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED';
        this.matBar.open('Cập nhật trạng thái thành công!', 'Đóng', { duration: 2000 });
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật trạng thái:', err);
        this.matBar.open('Cập nhật trạng thái thất bại!', 'Đóng', { duration: 2000 });
        this.getAllOrder();
      }
    });
  }

  changePageSize(newSize: number): void {
    if (newSize < 1 || newSize > 50) {
      this.matBar.open('Số bản ghi phải từ 1 đến 50!', 'Đóng', { duration: 2000 });
      return;
    }
    this.pageSize = newSize;
    this.page = 1;
    this.cdr.detectChanges();
  }

  goToPage(page: number): void {
    const maxPage = Math.ceil(this.allOrder?.length / this.pageSize) || 1;
    if (page < 1 || page > maxPage) {
      this.matBar.open(`Số trang phải từ 1 đến ${maxPage}!`, 'Đóng', { duration: 2000 });
      return;
    }
    this.page = page;
    this.cdr.detectChanges();
  }

  openModal(order: Order): void {
    this.selectedOrder = order;
    // Giả sử OrderService có phương thức getOrderItems để lấy danh sách món
    this.orderService.getOrderItemById(order.orderId).subscribe({
      next: (items) => {
        this.selectedItems = items;
        this.showModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách món:', err);
        this.matBar.open('Tải danh sách món thất bại!', 'Đóng', { duration: 2000 });
        this.showModal = true;
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrder = null;
    this.selectedItems = [];
    this.cdr.detectChanges();
  }

  printInvoice(): void {
    window.print()
  }

  // Kiểm tra có bộ lọc nào đang hoạt động không
  hasActiveFilters(): boolean {
    return !!(this.filterStartDate || this.filterEndDate || this.filterStatus || this.filterPaymentStatus);
  }

  // Áp dụng tất cả bộ lọc
  applyAllFilters(): void {
    // Kiểm tra validation cho ngày
    if (this.filterStartDate && this.filterEndDate) {
      if (new Date(this.filterStartDate) > new Date(this.filterEndDate)) {
        this.matBar.open('Ngày bắt đầu không được lớn hơn ngày kết thúc!', 'Đóng', { duration: 2000 });
        return;
      }
    }

    this.loading = true;
    let filteredOrders = [...this.originalOrders];

    // Lọc theo ngày (sử dụng API nếu có cả 2 ngày)
    if (this.filterStartDate && this.filterEndDate) {
      this.orderService.filterOrdersByDateRange(this.filterStartDate, this.filterEndDate).subscribe({
        next: (orders) => {
          filteredOrders = orders;
          this.applyStatusFilters(filteredOrders);
        },
        error: (err) => {
          this.loading = false;
          this.matBar.open('Lỗi khi lọc đơn hàng theo ngày!', 'Đóng', { duration: 2000 });
          console.error('Lỗi lọc đơn hàng:', err);
        }
      });
    } else {
      this.applyStatusFilters(filteredOrders);
    }
  }

  // Áp dụng lọc theo trạng thái
  private applyStatusFilters(orders: Order[]): void {
    let filteredOrders = [...orders];

    // Lọc theo trạng thái đơn hàng
    if (this.filterStatus) {
      filteredOrders = filteredOrders.filter(order => order.status === this.filterStatus);
    }

    // Lọc theo trạng thái thanh toán
    if (this.filterPaymentStatus) {
      filteredOrders = filteredOrders.filter(order => order.paymentStatus === this.filterPaymentStatus);
    }

    this.allOrder = filteredOrders;
    this.isFiltered = this.hasActiveFilters();
    this.updateStats();
    this.loading = false;
    this.page = 1; // Reset về trang đầu
    
    const filterMessage = this.buildFilterMessage(filteredOrders.length);
    this.matBar.open(filterMessage, 'Đóng', { duration: 3000 });
    this.cdr.detectChanges();
  }

  // Xây dựng thông báo lọc
  private buildFilterMessage(count: number): string {
    const filters = [];
    if (this.filterStartDate && this.filterEndDate) {
      filters.push(`từ ${this.filterStartDate} đến ${this.filterEndDate}`);
    }
    if (this.filterStatus) {
      filters.push(`trạng thái ${this.getStatusText(this.filterStatus)}`);
    }
    if (this.filterPaymentStatus) {
      filters.push(`thanh toán ${this.getPaymentStatusText(this.filterPaymentStatus)}`);
    }
    
    return `Đã lọc ${count} đơn hàng ${filters.length > 0 ? 'với ' + filters.join(', ') : ''}`;
  }

  // Xóa tất cả bộ lọc
  clearAllFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterStatus = '';
    this.filterPaymentStatus = '';
    this.isFiltered = false;
    this.allOrder = [...this.originalOrders];
    this.updateStats();
    this.page = 1;
    this.matBar.open('Đã xóa tất cả bộ lọc, hiển thị tất cả đơn hàng', 'Đóng', { duration: 2000 });
    this.cdr.detectChanges();
  }

  // Helper methods để hiển thị text
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xác nhận',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Hoàn tất',
      'DELIVERED': 'Đã giao'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusText(paymentStatus: string): string {
    const paymentMap: { [key: string]: string } = {
      'PENDING': 'Chưa thanh toán',
      'PAID': 'Đã thanh toán'
    };
    return paymentMap[paymentStatus] || paymentStatus;
  }
}