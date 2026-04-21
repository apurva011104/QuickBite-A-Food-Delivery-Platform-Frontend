import { Component, OnInit } from '@angular/core';
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

  constructor(private readonly cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.items = cart.cartItems;
        this.restaurantId = cart.restaurantId;
        this.totalPrice = cart.totalPrice;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItemFromCart(itemId).subscribe({
      next: () => this.loadCart()
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.loadCart()
    });
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get deliveryFee(): number {
    return this.items.length ? 40 : 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }
}