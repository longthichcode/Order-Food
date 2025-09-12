import { DecimalPipe } from "@angular/common";

export interface Food {
  foodId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  status: string;
  category: Category | null;
  isPromotion: boolean;
  orderCount: number;
  createdAt: string;
}

export interface Category {
    categoryId: number
    categoryName: string 
    description: string;
    isActive: boolean;
}
