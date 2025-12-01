import { promotions } from "./cart";
import { Food } from "./food";

export interface Order {
  orderId: number;
  user: {
      userId: number;
      username: string;
      password: string;
      fullName: string;
      phone: string;
      email: string;
      role: string;
      createdAt: string;
  };
  table: any | null;
  guestName: string;
  guestPhone: string;
  address: string;
  totalPrice: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED';
  paymentMethod: 'CASH' | 'PAYOS' | 'MOMO';
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED'; 
  paymentUrl: string ;
  promotion: promotions;
  createdAt: string;

  orderItems?: OrderItem[];
}

export interface OrderItem {
  orderItemId: number;
  order: Order;
  food: Food;
  quantity: number;
  price: number;
  note: string;
}

