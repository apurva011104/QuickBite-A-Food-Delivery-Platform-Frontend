import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderResponse, OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-tracking.html'
})
export class OrderTracking implements OnInit {
  order: OrderResponse | undefined;
  errorMessage = '';

  readonly statuses = ['PLACED', 'PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED'];
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Order not found.';
        this.cdr.detectChanges();
      }
    });
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) {
      return false;
    }

    const currentIndex = this.statuses.indexOf(this.order.orderStatus);
    const stepIndex = this.statuses.indexOf(step);

    return stepIndex <= currentIndex;
  }
}
