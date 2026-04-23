import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderResponse, OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-success.html'
})
export class OrderSuccess implements OnInit {
  order: OrderResponse | undefined;
  errorMessage = '';

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
}