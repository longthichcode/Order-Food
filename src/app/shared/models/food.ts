import { DecimalPipe } from "@angular/common";
import { User } from "./user";

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
  averageRating: number;
  reviewCount: number
}

export interface FoodReview{
  reviewId: number,
  food: Food,
  user: User,
  rating: number,
  isVisible: boolean,
  comment: string,
  createdAt : Date
}

export interface Category {
    categoryId: number
    categoryName: string 
    description: string;
    isActive: boolean;
}
