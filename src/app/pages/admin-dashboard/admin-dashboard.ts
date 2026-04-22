import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  pendingRestaurants: Restaurant[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  rejectionReasonMap: { [key: number]: string } = {};

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.restaurantService.getPendingRestaurants().subscribe({
      next: (data: Restaurant[]) => {
        this.pendingRestaurants = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load pending restaurants';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approve(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.restaurantService.approveRestaurant(id).subscribe({
      next: () => {
        this.successMessage = 'Restaurant approved';
        this.loadPending();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Approval failed';
        this.cdr.detectChanges();
      }
    });
  }

  reject(id: number): void {
    const reason = this.rejectionReasonMap[id];

    if (!reason || !reason.trim()) {
      this.errorMessage = 'Please enter rejection reason';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.restaurantService.rejectRestaurant(id, reason).subscribe({
      next: () => {
        this.successMessage = 'Restaurant rejected';
        this.rejectionReasonMap[id] = '';
        this.loadPending();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Rejection failed';
        this.cdr.detectChanges();
      }
    });
  }
}