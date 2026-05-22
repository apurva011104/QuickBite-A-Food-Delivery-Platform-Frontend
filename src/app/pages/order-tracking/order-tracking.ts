import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderResponse, OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-tracking.html'
})
export class OrderTracking implements OnInit, OnDestroy {
  order: OrderResponse | undefined;
  errorMessage = '';
  private orderUpdatesSubscription?: Subscription;
  private readonly pollMs = 10000;

  readonly statuses = ['PLACED', 'PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  
  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(orderId) || orderId <= 0) {
      this.errorMessage = 'Order not found.';
      this.cdr.detectChanges();
      return;
    }

    this.orderUpdatesSubscription = this.orderService.getOrderByIdLive(orderId, this.pollMs).subscribe({
      next: (order) => {
        this.order = order;
        this.errorMessage = '';

        if (this.isFinished(order.orderStatus)) {
          this.stopLiveUpdates();
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Order not found.';
        this.stopLiveUpdates();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopLiveUpdates();
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) {
      return false;
    }

    if (this.order.orderStatus === 'REJECTED') {
      return step === 'PLACED';
    }

    if (this.order.orderStatus === 'CANCELLED') {
      return step === 'PLACED';
    }

    const currentIndex = this.statuses.indexOf(this.order.orderStatus);
    const stepIndex = this.statuses.indexOf(step);

    return stepIndex <= currentIndex;
  }

  isTerminalFailure(): boolean {
    return this.order?.orderStatus === 'REJECTED' || this.order?.orderStatus === 'CANCELLED';
  }

  private isFinished(status: string): boolean {
    return status === 'DELIVERED' || status === 'REJECTED' || status === 'CANCELLED';
  }

  private stopLiveUpdates(): void {
    this.orderUpdatesSubscription?.unsubscribe();
    this.orderUpdatesSubscription = undefined;
  }
}
