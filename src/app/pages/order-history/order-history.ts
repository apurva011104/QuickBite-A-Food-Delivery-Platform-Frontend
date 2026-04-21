import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Order } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './order-history.html'
})
export class OrderHistory implements OnInit {
  orders: Order[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    if (this.authService.isCustomer()) {
      this.orders = this.orderService.getOrders();
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-700';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-orange-100 text-orange-700';
      case 'PLACED':
        return 'bg-purple-100 text-purple-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}