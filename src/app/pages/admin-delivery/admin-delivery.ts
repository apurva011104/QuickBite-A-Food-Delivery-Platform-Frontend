import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryAgentResponse, DeliveryService } from '../../core/services/delivery.service';
import { OrderResponse, OrderService } from '../../core/services/order.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

interface NearbyAgentSuggestion extends DeliveryAgentResponse {
  distanceKm: number;
}

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-delivery.html'
})
export class AdminDelivery implements OnInit {
  verifiedAgents: DeliveryAgentResponse[] = [];
  availableAgents: DeliveryAgentResponse[] = [];
  suggestedAgents: NearbyAgentSuggestion[] = [];

  verificationAgentId: number | null = null;
  selectedAgentId: number | null = null;
  orderId: number | null = null;
  radiusKm = 5;

  selectedOrder: OrderResponse | null = null;
  selectedRestaurant: Restaurant | null = null;

  loading = true;
  assigning = false;
  verifying = false;
  searchingOrder = false;
  loadingNearbyAgents = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly restaurantService: RestaurantService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.deliveryService.getAllVerifiedAgents().subscribe({
      next: (verified) => {
        this.verifiedAgents = [...verified];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load verified agents.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.deliveryService.getAllAvailableAgents().subscribe({
      next: (available) => {
        this.availableAgents = [...available];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load available agents.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verifyAgent(verified: boolean): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.verificationAgentId) {
      this.errorMessage = 'Enter an agent ID first.';
      return;
    }

    this.verifying = true;

    this.deliveryService.verifyAgent(this.verificationAgentId, verified).subscribe({
      next: (res) => {
        this.successMessage = res.message || (verified ? 'Agent approved.' : 'Agent rejected.');
        this.verificationAgentId = null;
        this.verifying = false;
        this.loadDashboard();
      },
      error: (err: any) => {
        this.verifying = false;
        this.errorMessage = err?.error?.message || 'Unable to update agent verification.';
        this.cdr.detectChanges();
      }
    });
  }

  lookupOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.orderId) {
      this.errorMessage = 'Enter an order ID first.';
      return;
    }

    this.searchingOrder = true;
    this.selectedAgentId = null;
    this.suggestedAgents = [];

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.restaurantService.getRestaurantById(order.restaurantId).subscribe({
          next: (restaurant) => {
            this.selectedOrder = order;
            this.selectedRestaurant = restaurant;
            this.searchingOrder = false;

            if (order.orderStatus !== 'READY_FOR_PICKUP') {
              this.errorMessage = 'Only READY_FOR_PICKUP orders can be assigned to an agent.';
              this.cdr.detectChanges();
              return;
            }

            if (!this.hasCoordinates(restaurant.latitude, restaurant.longitude)) {
              this.errorMessage = 'Restaurant pickup location is missing coordinates.';
              this.cdr.detectChanges();
              return;
            }

            this.refreshNearbyAgents();
          },
          error: (err: any) => {
            this.searchingOrder = false;
            this.selectedOrder = order;
            this.selectedRestaurant = null;
            this.errorMessage = err?.error?.message || 'Unable to load restaurant pickup details.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.searchingOrder = false;
        this.selectedOrder = null;
        this.selectedRestaurant = null;
        this.errorMessage = err?.error?.message || 'Unable to find that order.';
        this.cdr.detectChanges();
      }
    });
  }

  refreshNearbyAgents(): void {
    if (!this.selectedOrder || !this.selectedRestaurant) {
      this.errorMessage = 'Look up an order first.';
      return;
    }

    if (this.radiusKm <= 0) {
      this.errorMessage = 'Search radius must be greater than 0 km.';
      return;
    }

    const pickupLatitude = this.selectedRestaurant.latitude;
    const pickupLongitude = this.selectedRestaurant.longitude;

    if (!this.hasCoordinates(pickupLatitude, pickupLongitude)) {
      this.errorMessage = 'Restaurant pickup location is missing coordinates.';
      return;
    }

    const safePickupLatitude = pickupLatitude as number;
    const safePickupLongitude = pickupLongitude as number;

    this.loadingNearbyAgents = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.deliveryService.getNearbyAgents(safePickupLatitude, safePickupLongitude, this.radiusKm).subscribe({
      next: (agents) => {
        this.suggestedAgents = agents
          .map((agent) => ({
            ...agent,
            distanceKm: this.calculateDistanceKm(
              safePickupLatitude,
              safePickupLongitude,
              agent.currentLatitude,
              agent.currentLongitude
            )
          }))
          .sort((first, second) => first.distanceKm - second.distanceKm);

        if (this.suggestedAgents.length && !this.selectedAgentId) {
          this.selectedAgentId = this.suggestedAgents[0].agentId;
        }

        if (!this.suggestedAgents.length) {
          this.successMessage = 'No nearby available agents found in this radius. You can still assign manually.';
        }

        this.loadingNearbyAgents = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loadingNearbyAgents = false;
        this.errorMessage = err?.error?.message || 'Unable to load nearby agents.';
        this.cdr.detectChanges();
      }
    });
  }

  chooseAgent(agentId: number): void {
    this.selectedAgentId = agentId;
  }

  assignOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedOrder || !this.selectedRestaurant) {
      this.errorMessage = 'Look up a ready order first.';
      return;
    }

    if (!this.selectedAgentId) {
      this.errorMessage = 'Select an agent before assigning the order.';
      return;
    }

    if (this.selectedOrder.orderStatus !== 'READY_FOR_PICKUP') {
      this.errorMessage = 'Only READY_FOR_PICKUP orders can be assigned to an agent.';
      return;
    }

    this.assigning = true;

    this.deliveryService.assignOrder(this.selectedAgentId, this.selectedOrder.orderId).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Order assigned successfully.';
        this.assigning = false;
        this.clearAssignmentSelection();
        this.loadDashboard();
      },
      error: (err: any) => {
        this.assigning = false;
        this.errorMessage = err?.error?.message || 'Unable to assign order.';
        this.cdr.detectChanges();
      }
    });
  }

  getTripDistanceKm(): number | null {
    if (
      !this.selectedOrder ||
      !this.selectedRestaurant ||
      !this.hasCoordinates(this.selectedRestaurant.latitude, this.selectedRestaurant.longitude)
    ) {
      return null;
    }

    const pickupLatitude = this.selectedRestaurant.latitude as number;
    const pickupLongitude = this.selectedRestaurant.longitude as number;

    return this.calculateDistanceKm(
      pickupLatitude,
      pickupLongitude,
      this.selectedOrder.deliveryLatitude,
      this.selectedOrder.deliveryLongitude
    );
  }

  private clearAssignmentSelection(): void {
    this.selectedAgentId = null;
    this.orderId = null;
    this.selectedOrder = null;
    this.selectedRestaurant = null;
    this.suggestedAgents = [];
    this.radiusKm = 5;
  }

  private hasCoordinates(
    latitude: number | null | undefined,
    longitude: number | null | undefined
  ): boolean {
    return latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
  }

  private calculateDistanceKm(
    startLatitude: number,
    startLongitude: number,
    endLatitude: number | null,
    endLongitude: number | null
  ): number {
    if (!this.hasCoordinates(endLatitude, endLongitude)) {
      return Number.POSITIVE_INFINITY;
    }

    const safeEndLatitude = endLatitude as number;
    const safeEndLongitude = endLongitude as number;

    const earthRadiusKm = 6371;
    const latDistance = this.toRadians(safeEndLatitude - startLatitude);
    const lngDistance = this.toRadians(safeEndLongitude - startLongitude);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.toRadians(startLatitude)) *
        Math.cos(this.toRadians(safeEndLatitude)) *
        Math.sin(lngDistance / 2) *
        Math.sin(lngDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
