import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly ordersStorageKey = 'quickbite_orders';

  getOrders(): Order[] {
    const raw = localStorage.getItem(this.ordersStorageKey);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  }

  saveOrders(orders: Order[]): void {
    localStorage.setItem(this.ordersStorageKey, JSON.stringify(orders));
  }

  placeOrder(orderData: {
    customerId: number;
    restaurantId: number;
    items: CartItem[];
    totalAmount: number;
  }): Order {
    const orders = this.getOrders();

    const newOrder: Order = {
      id: Date.now(),
      customerId: orderData.customerId,
      restaurantId: orderData.restaurantId,
      items: orderData.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: orderData.totalAmount,
      status: 'PLACED',
      placedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    return newOrder;
  }

  getOrderById(orderId: number): Order | undefined {
    return this.getOrders().find((order) => order.id === orderId);
  }

  getOrdersByCustomerId(customerId: number): Order[] {
    return this.getOrders().filter((order) => order.customerId === customerId);
  }
}