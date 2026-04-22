import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantRequest, RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.html'
})
export class OwnerDashboard implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

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

    if (
      !this.form.name.trim() ||
      !this.form.cuisine.trim() ||
      !this.form.address.trim() ||
      !this.form.city.trim()
    ) {
      this.errorMessage = 'Please fill in the required restaurant fields.';
      return;
    }

    this.submitting = true;

    this.restaurantService.registerRestaurant(this.form).subscribe({
      next: () => {
        this.successMessage = 'Restaurant submitted successfully.';
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