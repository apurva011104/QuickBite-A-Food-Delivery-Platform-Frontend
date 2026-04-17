export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
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