import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, startWith, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface OrderItemRequest {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
}

export interface OrderRequest {
  restaurantId: number;
  discount?: number;
  paymentMode: PaymentMode;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  specialInstructions?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  orderItemId: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
}

export interface OrderResponse {
  orderId: number;
  customerId: number;
  restaurantId: number;
  deliveryAgentId: number | null;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMode: PaymentMode;
  orderStatus: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  estimatedDelivery: string;
  specialInstructions?: string;
  items: OrderItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  placeOrder(payload: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.baseUrl, payload);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.baseUrl}/customer`);
  }

  getMyOrdersLive(pollMs = 15000): Observable<OrderResponse[]> {
    return interval(pollMs).pipe(
      startWith(0),
      switchMap(() => this.getMyOrders())
    );
  }

  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.baseUrl}/${orderId}`);
  }

  getOrderByIdLive(orderId: number, pollMs = 10000): Observable<OrderResponse> {
    return interval(pollMs).pipe(
      startWith(0),
      switchMap(() => this.getOrderById(orderId))
    );
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(
      `${this.baseUrl}/${orderId}/status?status=${encodeURIComponent(status)}`,
      {}
    );
  }

  cancelOrder(orderId: number): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.baseUrl}/${orderId}/cancel`, {});
  }

  reorder(orderId: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/${orderId}/reorder`, {});
  }
}
