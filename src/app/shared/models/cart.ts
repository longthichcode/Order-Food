export interface CartItemDTO {
  cartItemId: number;
  foodId: number;
  foodName: string;
  foodImage: string;
  quantity: number;
  price: number;
  note: string;
}

export interface CartDTO {
  cartId: number;
  userId: number;
  promoCode: string | null;
  cartItems: CartItemDTO[];
  totalPrice: number;
}

export interface promotions{
  promoId: number,
  code: string,
  description: string,
  discountPercent: number,
  startDate: Date,
  endDate: Date,
  isActive: boolean
}