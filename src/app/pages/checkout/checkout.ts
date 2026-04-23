import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItemResponse } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, PaymentMode, OrderResponse } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  cartItems: CartItemResponse[] = [];
  restaurantId: number | null = null;

  fullAddress = '';
  city = '';
  pincode = '';
  specialInstructions = '';
  paymentMode: PaymentMode = 'COD';

  walletBalance = 0;
  walletLoading = true;

  errorMessage = '';
  submitting = false;

  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cartItems = [...cart.cartItems];
        this.restaurantId = cart.restaurantId;

        if (!this.cartItems.length) {
          this.router.navigateByUrl('/cart');
          return;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigateByUrl('/cart');
      }
    });

    this.paymentService.getWalletBalance().subscribe({
      next: (balance) => {
        this.walletBalance = balance;
        this.walletLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.walletBalance = 0;
        this.walletLoading = false;
        this.cdr.detectChanges();
      }
    });
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

  get walletSufficient(): boolean {
    return this.walletBalance >= this.total;
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

    if (!this.restaurantId || !this.cartItems.length) {
      this.errorMessage = 'Cart is empty.';
      return;
    }

    if (this.paymentMode === 'WALLET' && !this.walletSufficient) {
      this.errorMessage = 'Insufficient wallet balance.';
      return;
    }

    this.submitting = true;

    const payload = {
      restaurantId: this.restaurantId,
      discount: 0,
      paymentMode: this.paymentMode,
      deliveryAddress: `${this.fullAddress}, ${this.city} - ${this.pincode}`,
      specialInstructions: this.specialInstructions.trim() || undefined,
      items: this.cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization || undefined
      }))
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (order: OrderResponse) => {
        this.cartService.clearCart().subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigateByUrl(`/order-success/${order.orderId}`);
          },
          error: () => {
            this.submitting = false;
            this.router.navigateByUrl(`/order-success/${order.orderId}`);
          }
        });
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to place order.';
        this.cdr.detectChanges();
      }
    });
  }
}