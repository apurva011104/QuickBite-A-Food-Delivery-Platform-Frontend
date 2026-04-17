import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../core/models/cart-item.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.html'
})
export class Cart implements OnInit {
  items: CartItem[] = [];

  constructor(private readonly cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.items = this.cartService.getCartItems();
  }

  removeItem(menuItemId: number): void {
    this.cartService.removeFromCart(menuItemId);
    this.loadCart();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.loadCart();
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