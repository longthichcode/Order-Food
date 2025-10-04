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