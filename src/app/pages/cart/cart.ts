import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItemResponse } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.html'
})
export class Cart implements OnInit {
  items: CartItemResponse[] = [];
  restaurantId: number | null = null;
  totalPrice = 0;
  loading = true;
  errorMessage = '';
  itemTotal = 0;

  constructor(
    private readonly cartService: CartService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.items = [...cart.cartItems];
        this.restaurantId = cart.restaurantId;
        this.totalPrice = cart.totalPrice;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.items = [];
        this.restaurantId = null;
        this.totalPrice = 0;
        this.loading = false;
        this.errorMessage = err?.error?.message || '';
        this.cdr.detectChanges();
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItemFromCart(itemId).subscribe({
      next: () => this.loadCart(),
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to remove item.';
        this.cdr.detectChanges();
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.loadCart(),
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to clear cart.';
        this.cdr.detectChanges();
      }
    });
  }

  get subtotal(): number {
    this.itemTotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this.itemTotal;
  }

  get deliveryFee(): number {
    if(this.itemTotal>=500.0){
      return 0;
    }
    return 40;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }
}