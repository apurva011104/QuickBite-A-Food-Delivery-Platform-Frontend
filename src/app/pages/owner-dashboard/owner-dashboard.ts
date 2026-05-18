import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../core/models/restaurant.model';
import { OrderResponse, OrderService } from '../../core/services/order.service';
import {
  OwnerRestaurantDetailsResponse,
  RestaurantRequest,
  RestaurantService
} from '../../core/services/restaurant.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.html'
})
export class OwnerDashboard implements OnInit {
  restaurants: Restaurant[] = [];
  restaurantDetails: Record<number, OwnerRestaurantDetailsResponse> = {};
  detailsLoading: Record<number, boolean> = {};
  orderStatusLoading: Record<number, boolean> = {};
  expandedRestaurantId: number | null = null;
  loading = false;
  submitting = false;
  locating = false;

  errorMessage = '';
  successMessage = '';
  locationHelpMessage = '';

  form: RestaurantRequest = {
    name: '',
    description: '',
    cuisine: '',
    address: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
    phone: '',
    deliveryRadius: undefined,
    minOrderAmount: undefined,
    estimatedDeliveryMin: undefined
  };

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyRestaurants();
  }

  loadMyRestaurants(): void {
    this.loading = true;
    this.errorMessage = '';

    this.restaurantService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = [...restaurants];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load your restaurants.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitRestaurant(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.locationHelpMessage = '';

    if (
      !this.form.name.trim() ||
      !this.form.cuisine.trim() ||
      !this.form.address.trim() ||
      !this.form.city.trim()
    ) {
      this.errorMessage = 'Please fill in the required restaurant fields.';
      return;
    }

    if (!this.hasValidRestaurantCoordinates()) {
      this.errorMessage = 'Please add a valid restaurant location before registering.';
      return;
    }

    this.submitting = true;

    this.restaurantService.registerRestaurant(this.form).subscribe({
      next: () => {
        this.successMessage = 'Restaurant submitted successfully.';
        this.locationHelpMessage = '';
        this.submitting = false;
        this.resetForm();
        this.loadMyRestaurants();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to register restaurant.';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleRestaurant(restaurantId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.restaurantService.toggleRestaurant(restaurantId).subscribe({
      next: () => {
        this.successMessage = 'Restaurant status updated.';
        this.loadMyRestaurants();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to toggle restaurant status.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteRestaurant(restaurantId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.restaurantService.deleteRestaurant(restaurantId).subscribe({
      next: () => {
        this.successMessage = 'Restaurant deleted successfully.';
        this.loadMyRestaurants();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to delete restaurant.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleRestaurantOrders(restaurantId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.expandedRestaurantId === restaurantId) {
      this.expandedRestaurantId = null;
      return;
    }

    this.expandedRestaurantId = restaurantId;

    if (this.restaurantDetails[restaurantId]) {
      return;
    }

    this.detailsLoading[restaurantId] = true;
    this.restaurantService.getOwnerRestaurantDetails(restaurantId).subscribe({
      next: (details) => {
        this.restaurantDetails[restaurantId] = details;
        this.detailsLoading[restaurantId] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load restaurant orders.';
        this.detailsLoading[restaurantId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  useCurrentLocation(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.locationHelpMessage = '';

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.errorMessage = 'Location access is not supported in this browser. Enter coordinates manually.';
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.latitude = Number(position.coords.latitude.toFixed(6));
        this.form.longitude = Number(position.coords.longitude.toFixed(6));
        this.locationHelpMessage = 'Current device location added to the restaurant form.';
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

  getRestaurantDetails(restaurantId: number): OwnerRestaurantDetailsResponse | undefined {
    return this.restaurantDetails[restaurantId];
  }

  isExpanded(restaurantId: number): boolean {
    return this.expandedRestaurantId === restaurantId;
  }

  isOrderStatusLoading(orderId: number): boolean {
    return !!this.orderStatusLoading[orderId];
  }

  canStartPreparing(order: OrderResponse): boolean {
    return order.orderStatus === 'CONFIRMED';
  }

  canMarkReadyForPickup(order: OrderResponse): boolean {
    return order.orderStatus === 'PREPARING';
  }

  updateOrderStatus(restaurantId: number, order: OrderResponse, status: 'PREPARING' | 'READY_FOR_PICKUP'): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.orderStatusLoading[order.orderId] = true;

    this.orderService.updateOrderStatus(order.orderId, status).subscribe({
      next: (updatedOrder) => {
        const details = this.restaurantDetails[restaurantId];
        if (details) {
          details.orders = details.orders.map((existingOrder) =>
            existingOrder.orderId === updatedOrder.orderId ? updatedOrder : existingOrder
          );
        }

        this.successMessage = status === 'PREPARING'
          ? `Order #${order.orderId} is now being prepared.`
          : `Order #${order.orderId} is ready for pickup.`;
        this.orderStatusLoading[order.orderId] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to update order status.';
        this.orderStatusLoading[order.orderId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  private hasValidRestaurantCoordinates(): boolean {
    return this.isWithinRange(this.form.latitude, -90, 90)
      && this.isWithinRange(this.form.longitude, -180, 180);
  }

  private isWithinRange(value: number | undefined, min: number, max: number): value is number {
    return value !== undefined && Number.isFinite(value) && value >= min && value <= max;
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

  private resetForm(): void {
    this.form = {
      name: '',
      description: '',
      cuisine: '',
      address: '',
      city: '',
      latitude: undefined,
      longitude: undefined,
      phone: '',
      deliveryRadius: undefined,
      minOrderAmount: undefined,
      estimatedDeliveryMin: undefined
    };
  }
}
