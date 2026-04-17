import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../../core/models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  cartItems: CartItem[] = [];

  fullAddress = '';
  city = '';
  pincode = '';
  paymentMode: 'COD' | 'UPI' | 'CARD' | 'WALLET' = 'COD';

  errorMessage = '';

  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();

    if (!this.cartItems.length) {
      this.router.navigateByUrl('/cart');
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get deliveryFee(): number {
    return this.cartItems.length ? 40 : 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  placeOrder(): void {
    this.errorMessage = '';

    if (!this.fullAddress.trim() || !this.city.trim() || !this.pincode.trim()) {
      this.errorMessage = 'Please fill in complete delivery details.';
      return;
    }

    const user = this.authService.getLoggedInUser();

    if (!user || user.role !== 'CUSTOMER') {
      this.router.navigateByUrl('/login');
      return;
    }

    const order = this.orderService.placeOrder({
      customerId: user.id,
      restaurantId: 1,
      items: this.cartItems,
      totalAmount: this.total
    });

    this.cartService.clearCart();
    this.router.navigateByUrl(`/order-success/${order.id}`);
  }
}