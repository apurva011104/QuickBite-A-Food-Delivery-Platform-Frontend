export type PaymentMode = 'COD' | 'WALLET' | 'CARD' | 'UPI';

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERED'
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
