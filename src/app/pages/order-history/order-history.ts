import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderResponse, OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './order-history.html'
})
export class OrderHistory implements OnInit, OnDestroy {
  orders: OrderResponse[] = [];
  errorMessage = '';
  loading = true;
  reordering = false;
  private ordersSubscription?: Subscription;
  private readonly pollMs = 15000;

  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startLiveUpdates();
  }

  ngOnDestroy(): void {
    this.stopLiveUpdates();
  }

  loadOrders(): void {
    this.loading = this.orders.length === 0;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = [...orders];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load orders.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private startLiveUpdates(): void {
    this.loading = true;
    this.errorMessage = '';

    this.ordersSubscription?.unsubscribe();
    this.ordersSubscription = this.orderService.getMyOrdersLive(this.pollMs).subscribe({
      next: (orders) => {
        this.orders = [...orders];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load orders.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(orderId: number): void {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to cancel order.';
        this.cdr.detectChanges();
      }
    });
  }

  reorderToCart(order: OrderResponse): void {
    if (!order.items.length) {
      this.errorMessage = 'This order has no items to reorder.';
      this.cdr.detectChanges();
      return;
    }

    this.reordering = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.cartService.clearCart().subscribe({
      next: () => {
        this.addItemsSequentially(order, 0);
      },
      error: (err: any) => {
        this.reordering = false;
        this.errorMessage = err?.error?.message || 'Unable to prepare cart for reorder.';
        this.cdr.detectChanges();
      }
    });
  }

  private addItemsSequentially(order: OrderResponse, index: number): void {
    if (index >= order.items.length) {
      this.reordering = false;
      this.cdr.detectChanges();
      this.router.navigateByUrl('/cart');
      return;
    }

    const item = order.items[index];

    this.cartService.addItemToCart({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customization: item.customization || undefined
    }).subscribe({
      next: () => {
        this.addItemsSequentially(order, index + 1);
      },
      error: (err: any) => {
        this.reordering = false;
        this.errorMessage = err?.error?.message || `Unable to add ${item.name} to cart.`;
        this.cdr.detectChanges();
      }
    });
  }

  canCancel(status: string): boolean {
    return status === 'PLACED' || status === 'PAYMENT_PENDING';
  }
  
  getStatusClasses(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'OUT_FOR_DELIVERY':
        return 'bg-sky-100 text-sky-700';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-700';
      case 'READY_FOR_PICKUP':
        return 'bg-cyan-100 text-cyan-700';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-orange-100 text-orange-700';
      case 'PAYMENT_PENDING':
        return 'bg-blue-100 text-blue-700';
      case 'PLACED':
        return 'bg-purple-100 text-purple-700';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  private stopLiveUpdates(): void {
    this.ordersSubscription?.unsubscribe();
    this.ordersSubscription = undefined;
  }
}
