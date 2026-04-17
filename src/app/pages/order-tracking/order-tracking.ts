import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-tracking.html'
})
export class OrderTracking implements OnInit {
  order: Order | undefined;

  readonly statuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED_UP', 'DELIVERED'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.order = this.orderService.getOrderById(orderId);
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) {
      return false;
    }

    const currentIndex = this.statuses.indexOf(this.order.status);
    const stepIndex = this.statuses.indexOf(step);

    return stepIndex <= currentIndex;
  }
}