import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItemResponse } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, PaymentMode, OrderResponse } from '../../core/services/order.service';
import { PaymentService, RazorpayOrderResponse } from '../../core/services/payment.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  deliveryLatitude: number | null = null;
  deliveryLongitude: number | null = null;
  specialInstructions = '';
  paymentMode: PaymentMode = 'COD';

  walletBalance = 0;
  walletLoading = true;
  locating = false;
  locationHelpMessage = '';

  errorMessage = '';
  submitting = false;
  onlineOrderId: number | null = null;

  itemTotal = 0;

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
    this.itemTotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return this.itemTotal;
  }

  get deliveryFee(): number {
    return this.subtotal >= 500 ? 0 : 40;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  get walletSufficient(): boolean {
    return this.walletBalance >= this.total;
  }

  placeOrder(): void {
    this.errorMessage = '';
    this.locationHelpMessage = '';

    if (!this.restaurantId) {
      this.errorMessage = 'Restaurant not found for this cart.';
      return;
    }

    if (!this.fullAddress.trim() || !this.city.trim() || !this.pincode.trim()) {
      this.errorMessage = 'Please enter full address, city and pincode.';
      return;
    }

    if (!this.isValidIndianPincode(this.pincode)) {
      this.errorMessage = 'Please enter a valid 6-digit pincode.';
      return;
    }

    if (!this.hasValidDeliveryCoordinates()) {
      this.errorMessage = 'Please confirm a valid delivery location before placing the order.';
      return;
    }

    if (this.paymentMode === 'WALLET' && !this.walletSufficient) {
      this.errorMessage = 'Insufficient wallet balance.';
      return;
    }

    if (this.requiresRazorpayCheckout() && !this.isRazorpayAvailable()) {
      this.errorMessage = 'Razorpay Checkout is unavailable right now. Please refresh and try again.';
      return;
    }

    const deliveryAddress = `${this.fullAddress.trim()}, ${this.city.trim()} - ${this.pincode.trim()}`;

    this.submitting = true;

    this.orderService.placeOrder({
      restaurantId: this.restaurantId,
      discount: 0,
      paymentMode: this.paymentMode,
      deliveryAddress,
      deliveryLatitude: this.deliveryLatitude!,
      deliveryLongitude: this.deliveryLongitude!,
      specialInstructions: this.specialInstructions.trim() || undefined,
      items: this.cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization || undefined
      }))
    }).subscribe({
      next: (order) => {
        if (this.paymentMode === 'CARD' || this.paymentMode === 'UPI') {
          this.onlineOrderId = order.orderId;
          this.startRazorpayPayment(order);
          return;
        }

        this.afterOrderSuccess(order.orderId);
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to place order.';
        this.cdr.detectChanges();
      }
    });
  }

  useCurrentLocation(): void {
    this.errorMessage = '';
    this.locationHelpMessage = '';

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.errorMessage = 'Location access is not supported in this browser. Enter coordinates manually.';
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.deliveryLatitude = Number(position.coords.latitude.toFixed(6));
        this.deliveryLongitude = Number(position.coords.longitude.toFixed(6));
        this.locationHelpMessage = 'Current device location added to this order.';
        this.locating = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.locating = false;
        this.errorMessage = this.getGeolocationErrorMessage(error);
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  onLocationInputChange(): void {
    this.locationHelpMessage = '';
  }

  private startRazorpayPayment(order: OrderResponse): void {
    if (!this.isRazorpayAvailable()) {
      this.handleOnlinePaymentFailure(
        order.orderId,
        'Razorpay Checkout failed to load. Please refresh and try again.'
      );
      return;
    }

    this.paymentService.createRazorpayOrder({
      orderId: order.orderId,
      amount: order.finalAmount
    }).subscribe({
      next: (razorpayOrder) => {
        this.openRazorpayCheckout(order, razorpayOrder);
      },
      error: (err: any) => {
        this.handleOnlinePaymentFailure(
          order.orderId,
          err?.error?.message || 'Unable to create Razorpay order.'
        );
      }
    });
  }

  private openRazorpayCheckout(order: OrderResponse, razorpayOrder: RazorpayOrderResponse): void {
    if (!this.isRazorpayAvailable()) {
      this.handleOnlinePaymentFailure(
        order.orderId,
        'Razorpay Checkout is unavailable right now. Please try again.'
      );
      return;
    }

    const user = this.authService.getLoggedInUser();

    const options = {
      key: razorpayOrder.keyId,
      amount: Math.round(razorpayOrder.amount * 100),
      currency: razorpayOrder.currency,
      name: 'QuickBite',
      description: `Payment for Order #${order.orderId}`,
      order_id: razorpayOrder.razorpayOrderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phoneNumber || ''
      },
      notes: {
        quickbiteOrderId: order.orderId
      },
      theme: {
        color: '#f97316'
      },
      handler: (response: any) => {
        this.verifyRazorpayPayment(order.orderId, response);
      },
      modal: {
        ondismiss: () => {
          this.handleOnlinePaymentFailure(
            order.orderId,
            'Payment cancelled. Your order has been cancelled.'
          );
        }
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', (response: any) => {
      this.handleOnlinePaymentFailure(
        order.orderId,
        response?.error?.description || 'Payment failed. Your order has been cancelled.'
      );
    });

    razorpay.open();
  }

  private requiresRazorpayCheckout(): boolean {
    return this.paymentMode === 'CARD' || this.paymentMode === 'UPI';
  }

  private isRazorpayAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.Razorpay === 'function';
  }

  private hasValidDeliveryCoordinates(): boolean {
    return this.isWithinRange(this.deliveryLatitude, -90, 90)
      && this.isWithinRange(this.deliveryLongitude, -180, 180);
  }

  private isWithinRange(value: number | null, min: number, max: number): value is number {
    return value !== null && Number.isFinite(value) && value >= min && value <= max;
  }

  private isValidIndianPincode(value: string): boolean {
    return /^\d{6}$/.test(value.trim());
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission was denied. Allow access or enter coordinates manually.';
      case error.POSITION_UNAVAILABLE:
        return 'Your current location could not be determined. Try again or enter coordinates manually.';
      case error.TIMEOUT:
        return 'Location lookup timed out. Please try again.';
      default:
        return 'Unable to fetch your current location right now.';
    }
  }

  private verifyRazorpayPayment(orderId: number, response: any): void {
    this.paymentService.verifyRazorpayPayment({
      orderId,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }).subscribe({
      next: () => {
        this.onlineOrderId = null;
        this.afterOrderSuccess(orderId);
      },
      error: (err: any) => {
        this.handleOnlinePaymentFailure(
          orderId,
          err?.error?.message || 'Payment verification failed. Your order has been cancelled.'
        );
      }
    });
  }

  private afterOrderSuccess(orderId: number): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.submitting = false;
        this.onlineOrderId = null;
        this.router.navigate(['/order-success', orderId]);
      },
      error: () => {
        this.submitting = false;
        this.onlineOrderId = null;
        this.router.navigate(['/order-success', orderId]);
      }
    });
  }

  private handleOnlinePaymentFailure(orderId: number, message: string): void {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.finalizeOnlinePaymentFailure(message);
      },
      error: () => {
        this.finalizeOnlinePaymentFailure(
          `${message} Order #${orderId} could not be auto-cancelled. Please cancel it from Order History.`
        );
      }
    });
  }

  private finalizeOnlinePaymentFailure(message: string): void {
    this.submitting = false;
    this.onlineOrderId = null;
    this.errorMessage = message;
    this.cdr.detectChanges();
  }
}
