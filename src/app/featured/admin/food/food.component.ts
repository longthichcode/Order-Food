import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FoodServiceService } from '../../../core/services/food-service.service';
import { CategoryServiceService } from '../../../core/services/category-service.service';
import { Category, Food } from '../../../shared/models/food';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { HttpClient, HttpResponse } from '@angular/common/http';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';

// Pagination
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminHeaderComponent } from "../../../shared/components/admin/admin-header/admin-header.component";
import { AdminSideBarComponent } from "../../../shared/components/admin/admin-side-bar/admin-side-bar.component";

@Component({
  standalone: true,
  selector: 'app-food',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDialogModule,
    NgxPaginationModule,
    AdminHeaderComponent,
    AdminSideBarComponent
  ],
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {
  // Danh sách món ăn
  listFoods: Food[] = [];
  originalFoods: Food[] = [];

  // Danh mục
  listCategory: Category[] = [];
  selectedCategory: number = 0;

  // Sidebar đóng, mở
  sidebarOpen: boolean = true;

  // UI state
  loading = false;
  error = '';
  displayedColumns: string[] = [
    'foodId', 'name', 'price', 'category', 'status',
    'isPromotion', 'orderCount', 'actions'
  ];

  // Modal sửa
  isEditModalOpen = false;
  foodEdit: Food | null = null;
  categorySelectEdit: number = 0;

  // Modal thêm mới
  isAddModalOpen = false;
  foodAdd: Food = {
    foodId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    status: 'OUT_OF_STOCK',
    category: {
      categoryId: 0,
      categoryName: 'string',
      description: '',
      isActive: false,
    },
    isPromotion: false,
    orderCount: 0,
    createdAt: '',
  };
  categorySelectAdd: number = 0;

  // Modal lỗi nhập file
  isErrorModalOpen = false;
  importResult: {
    success: boolean,
    insertedCount: number,
    skippedCount: number,
    errorMessage?: string,
    errorFileBlob?: Blob | null
  } | null = null;

  // Pagination
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // File choose
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  oldImg: string | undefined;

  constructor(
    private foodService: FoodServiceService,
    private categoryService: CategoryServiceService,
    private matSnackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getAllFoods();
    this.getAllCategories();
  }

  /** Lấy tất cả món ăn */
  getAllFoods(): void {
    this.loading = true;
    this.error = '';

    this.foodService.getAllFoods().subscribe({
      next: (foods) => {
        this.listFoods = foods;
        this.originalFoods = foods;
        this.totalItems = foods.length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách món ăn: ' + err.message;
        this.loading = false;
      }
    });
  }

  /** Tìm món theo tên */
  searchByName(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.listFoods = value
      ? this.originalFoods.filter(f => f.name.toLowerCase().includes(value))
      : this.originalFoods;

    this.totalItems = this.listFoods.length;
  }

  /** Lấy tất cả danh mục */
  getAllCategories(): void {
    this.loading = true;
    this.error = '';

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.listCategory = categories;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách danh mục: ' + err.message;
        this.loading = false;
      }
    });
  }

  /** Lọc món theo danh mục */
  filterByCategory(categoryId: number): void {
    if (categoryId == 0) {
      // Tất cả → lấy lại toàn bộ từ originalFoods
      this.listFoods = this.originalFoods ;
    } else {
      // Lọc theo categoryId
      this.listFoods = this.originalFoods.filter(
        f => f.category?.categoryId === categoryId
      );
    }

    this.totalItems = this.listFoods.length;
  }



  /** Xóa món ăn */
  deleteFood(foodId: number): void {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này?')) {
      this.foodService.deleteFood(foodId).subscribe({
        next: () => {
          this.matSnackBar.open('Xóa món thành công!', 'Đóng', { duration: 2000 });
          this.getAllFoods();
        },
        error: () => {
          this.matSnackBar.open('Xóa món thất bại!', 'Đóng', { duration: 2000 });
        }
      });
    }
  }

  /** Mở modal sửa */
  openEditModal(food: Food) {
    this.foodEdit = { ...food };
    if (food.category?.categoryId != null) {
      this.categorySelectEdit = food.category.categoryId;
    }
    this.oldImg = food.imageUrl;
    this.previewUrl = food.imageUrl ? 'assets/' + food.imageUrl : null;
    this.isEditModalOpen = true;
  }

  /** Chọn file ảnh */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      if (this.foodEdit != null) {
        this.foodEdit.imageUrl = this.selectedFile.name;
      }
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /** Đóng modal sửa */
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.foodEdit = null;
  }

  /** Lấy món ăn theo ID */
  getById(foodId: number): void {
    this.loading = true;
    this.error = '';

    this.foodService.getById(foodId).subscribe({
      next: (food) => {
        this.foodEdit = { ...food };
        this.foodEdit.category = food.category;
        this.oldImg = food.imageUrl;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể lấy thông tin món ăn: ' + err.message;
        this.loading = false;
      }
    });
  }

  /** Cập nhật món ăn */
  updateFood(): void {
    if (this.foodEdit) {
      this.foodEdit.category = { categoryId: this.categorySelectEdit } as any;
      this.foodService.updateFood(this.foodEdit).subscribe({
        next: () => {
          this.matSnackBar.open('Cập nhật thành công!', 'Đóng', 
            { 
              duration: 2000 ,
              panelClass:['success']
            });
          this.getAllFoods();
          this.closeEditModal();
        },
        error: (err) => console.error('Lỗi cập nhật', err)
      });
    }
  }

  /** Chọn ảnh để thêm */
  onFileSelectedAdd(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      if (this.foodAdd != null) {
        this.foodAdd.imageUrl = this.selectedFile.name;
      }
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /** Mở modal thêm */
  openAddModal() {
    this.isAddModalOpen = true;
    this.previewUrl = '';
  }

  /** Thêm món mới */
  addFood(): void {
    this.loading = true;
    this.error = '';
    this.foodAdd.category = { categoryId: this.categorySelectAdd } as any;

    this.foodService.addFood(this.foodAdd).subscribe({
      next: () => {
        this.matSnackBar.open('Đã thêm món mới', 'Đóng', { duration: 2000 });
        this.loading = false;
        this.getAllFoods();
        this.getAllCategories();
        this.closeAddModal();
      },
      error: (err) => {
        this.error = err.message;
        this.matSnackBar.open('Thêm món thất bại', 'Đóng', { duration: 2000 });
        console.log('Lỗi không thêm được món mới: ' + this.error);
        this.loading = false;
      }
    });
  }

  /** Đóng modal thêm */
  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.foodAdd = {
      foodId: 0,
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      status: 'OUT_OF_STOCK',
      category: {
        categoryId: 0,
        categoryName: 'string',
        description: '',
        isActive: false,
      },
      isPromotion: false,
      orderCount: 0,
      createdAt: '',
    };
  }

  /** Hiển thị tên danh mục */
  getCategoryName(category: Category | null): string {
    return category ? category.categoryName : 'Không phân loại';
  }

  /** Đổi màu trạng thái */
  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#1b0300';
      case 'OUT_OF_STOCK': return '#800000';
      default: return 'gray';
    }
  }

  /** Format tiền VND */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /** Xuất file Excel */
  exportToExcel(): void {
    const data = this.listFoods.map(food => ({
      'ID': food.foodId,
      'Tên món': food.name,
      'Mô tả': food.description,
      'Giá': this.formatPrice(food.price),
      'Danh mục': this.getCategoryName(food.category),
      'Trạng thái': food.status,
      'Khuyến mãi': food.isPromotion ? 'Có' : 'Không',
      'Đã bán': food.orderCount,
      'Ngày tạo': food.createdAt
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách món ăn');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(dataBlob, 'Danh_sach_mon_an' + fileExtension);
  }

  /** Nhập file Excel */
  onFileImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.loading = true;
      this.error = '';

      this.http.post('http://localhost:8000/foods/import', formData, { observe: 'response', responseType: 'blob' })
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            this.loading = false;
            const contentType = response.headers.get('content-type');

            if (contentType === 'application/json' && response.body) {
              // Phản hồi JSON
              response.body.text().then((text: string) => {
                const result = JSON.parse(text);
                if (result.success && result.skippedCount === 0) {
                  this.matSnackBar.open(`Nhập thành công ${result.insertedCount} món ăn!`, 'Đóng', { duration: 3000 });
                  this.getAllFoods();
                } else {
                  this.importResult = {
                    success: result.success,
                    insertedCount: result.insertedCount || 0,
                    skippedCount: result.skippedCount || 0,
                    errorMessage: result.errorMessage || 'Có lỗi trong quá trình nhập file'
                  };
                  this.isErrorModalOpen = true;
                  this.getAllFoods();
                }
              });
            } else if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && response.body) {
              // Phản hồi file lỗi
              response.body.text().then((text: string) => {
                try {
                  const result = JSON.parse(text); // Giả sử backend gửi JSON kèm file
                  this.importResult = {
                    success: result.success || false,
                    insertedCount: result.insertedCount || 0,
                    skippedCount: result.skippedCount || 0,
                    errorMessage: result.errorMessage || `Có ${result.skippedCount || 0} dòng không hợp lệ. Vui lòng kiểm tra file lỗi.`,
                    errorFileBlob: response.body
                  };
                } catch {
                  // Nếu body không phải JSON, giả sử là file lỗi thuần
                  this.importResult = {
                    success: false,
                    insertedCount: 0,
                    skippedCount: 0,
                    errorMessage: 'Có lỗi trong file Excel. Vui lòng kiểm tra file lỗi.',
                    errorFileBlob: response.body
                  };
                }
                this.isErrorModalOpen = true;
                this.getAllFoods();
              });
            }
          },
          error: (err) => {
            this.loading = false;
            err.error.text().then((text: string) => {
              try {
                const errorResult = JSON.parse(text);
                this.importResult = {
                  success: false,
                  insertedCount: errorResult.insertedCount || 0,
                  skippedCount: errorResult.skippedCount || 0,
                  errorMessage: errorResult.errorMessage || 'Lỗi khi nhập file Excel: ' + err.message
                };
              } catch {
                this.importResult = {
                  success: false,
                  insertedCount: 0,
                  skippedCount: 0,
                  errorMessage: 'Lỗi khi nhập file Excel: ' + err.message
                };
              }
              this.isErrorModalOpen = true;
            });
          }
        });

      // Reset input
      input.value = '';
    }
  }

  /** Tải file lỗi */
  downloadErrorFile(): void {
    if (this.importResult?.errorFileBlob) {
      FileSaver.saveAs(this.importResult.errorFileBlob, 'Error_Foods.xlsx');
      this.closeErrorModal();
    }
  }

  /** Tải file mẫu */
  downloadModelFile(): void {
    const sampleData = [
      {
        'Tên món': 'Phở bò',
        'Mô tả': 'Phở bò Hà Nội truyền thống',
        'Giá': 50000,
        'Danh mục': this.listCategory[0]?.categoryName || 'Ẩm thực Việt Nam',
        'Trạng thái': 'AVAILABLE',
        'Khuyến mãi': 'Có',
        'Đã bán': 10,
        'Ngày tạo': '2023-10-01T12:00:00'
      },
      {
        'Tên món': 'Bún chả',
        'Mô tả': 'Bún chả đặc biệt',
        'Giá': 45000,
        'Danh mục': this.listCategory[0]?.categoryName || 'Ẩm thực Việt Nam',
        'Trạng thái': 'AVAILABLE',
        'Khuyến mãi': 'Không',
        'Đã bán': 5,
        'Ngày tạo': '2023-10-02T12:00:00'
      }
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sampleData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu món ăn');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(dataBlob, 'Sample_Foods.xlsx');
  }

  /** Đóng modal lỗi */
  closeErrorModal(): void {
    this.isErrorModalOpen = false;
    this.importResult = null;
  }

  /*============================ CATEGORY =========================*/
  categoryChoose: Category = {
    categoryId: 0,
    categoryName: "",
    description: '',
    isActive: false
  }
  categoryAdd = {
    categoryName: "",
    description: '',
    isActive: false
  }

  isOpenModalCat: boolean = false;
  isOpenModalAddCat: boolean = false;

  openModalCat(id: number): void {
    const found = this.listCategory.find(cat => cat.categoryId === id);
    if (found) {
      this.categoryChoose = { ...found };
      this.isOpenModalCat = true;
    }
  }

  openModalCatAdd(): void {
    this.categoryAdd = {
      categoryName: "",
      description: '',
      isActive: false
    };
    this.isOpenModalAddCat = true;
  }

  addCategory(): void {
    this.loading = true;
    this.error = '';

    this.categoryService.addCategory(this.categoryAdd).subscribe({
      next: () => {
        this.matSnackBar.open('Đã thêm danh mục mới', 'Đóng', { duration: 2000 });
        this.loading = false;
        this.getAllFoods();
        this.getAllCategories();
        this.isOpenModalAddCat = false;
      },
      error: (err) => {
        this.error = err.message;
        this.matSnackBar.open('Thêm danh mục thất bại', 'Đóng', { duration: 2000 });
        console.log('Lỗi không thêm được danh mục mới: ' + this.error);
        this.loading = false;
      }
    });
  }

  deleteCategory(id: number): void {
    this.loading = true;
    this.error = '';

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.matSnackBar.open('Đã xóa danh mục', 'Đóng', { duration: 2000 });
        this.loading = false;
        this.getAllFoods();
        this.getAllCategories();
        this.isOpenModalCat = false;
      },
      error: (err) => {
        this.error = err.message;
        this.matSnackBar.open('Xóa danh mục thất bại', 'Đóng', { duration: 2000 });
        console.log('Lỗi không xóa được danh mục: ' + this.error);
        this.loading = false;
        this.isOpenModalCat = false;
      }
    });
  }

  updateCategory(): void {
    this.loading = true;
    this.error = '';

    this.categoryService.updateCategory(this.categoryChoose).subscribe({
      next: () => {
        this.matSnackBar.open('Đã cập nhật danh mục', 'Đóng', { duration: 2000 });
        this.loading = false;
        this.getAllFoods();
        this.getAllCategories();
        this.isOpenModalCat = false;
      },
      error: (err) => {
        this.error = err.message;
        this.matSnackBar.open('Cập nhật danh mục thất bại', 'Đóng', { duration: 2000 });
        console.log('Lỗi không cập nhật được danh mục: ' + this.error);
        this.loading = false;
      }
    });
  }
}