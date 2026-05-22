export type PaymentMode = 'COD' | 'WALLET' | 'CARD' | 'UPI';

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Order {
  id: number;
  customerId: number;
  restaurantId: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  placedAt: string;
}
