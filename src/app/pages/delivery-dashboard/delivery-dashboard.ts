import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ActiveDeliveryResponse,
  DeliveryAgentRequest,
  DeliveryAgentResponse,
  DeliveryService
} from '../../core/services/delivery.service';
import { OrderResponse, OrderService, OrderStatus } from '../../core/services/order.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';

interface DeliveryCard extends ActiveDeliveryResponse {
  order: OrderResponse | null;
  restaurant: Restaurant | null;
}

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-dashboard.html'
})
export class DeliveryDashboard implements OnInit {
  agent: DeliveryAgentResponse | null = null;
  activeDeliveries: DeliveryCard[] = [];

  registerForm: DeliveryAgentRequest = {
    fullName: '',
    phone: '',
    vehicleType: 'BIKE',
    vehicleNumber: ''
  };

  latitude: number | null = null;
  longitude: number | null = null;

  loading = true;
  registering = false;
  updatingLocation = false;
  updatingAvailability = false;
  locating = false;
  processingDeliveryId: number | null = null;

  errorMessage = '';
  successMessage = '';
  locationHelpMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly restaurantService: RestaurantService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAgentDashboard();
  }

  loadAgentDashboard(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const user = this.authService.getLoggedInUser();

    if (!user?.id) {
      this.errorMessage = 'Unable to identify current user.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.deliveryService.getAgentByUserId(user.id).subscribe({
      next: (agent) => {
        this.agent = agent;
        this.registerForm = {
          fullName: agent.fullName,
          phone: agent.phone,
          vehicleType: agent.vehicleType,
          vehicleNumber: agent.vehicleNumber
        };
        this.latitude = agent.currentLatitude;
        this.longitude = agent.currentLongitude;
        this.loadActiveDeliveries(agent.agentId);
      },
      error: () => {
        this.agent = null;
        this.activeDeliveries = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadActiveDeliveries(agentId: number): void {
    this.deliveryService.getActiveDeliveries(agentId).subscribe({
      next: (deliveries) => {
        if (!deliveries.length) {
          this.activeDeliveries = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const detailRequests = deliveries.map((delivery) =>
          this.orderService.getOrderById(delivery.orderId).pipe(
            switchMap((order) =>
              this.restaurantService.getRestaurantById(order.restaurantId).pipe(
                map((restaurant) => ({ order, restaurant }))
              )
            ),
            catchError(() => of({ order: null, restaurant: null }))
          )
        );

        forkJoin(detailRequests).subscribe({
          next: (details) => {
            this.activeDeliveries = deliveries.map((delivery, index) => ({
              ...delivery,
              order: details[index].order,
              restaurant: details[index].restaurant
            }));
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.activeDeliveries = deliveries.map((delivery) => ({
              ...delivery,
              order: null,
              restaurant: null
            }));
            this.loading = false;
            this.errorMessage = err?.error?.message || 'Unable to enrich active deliveries.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load active deliveries.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  registerAgent(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.registerForm.fullName.trim() ||
      !this.registerForm.phone.trim() ||
      !this.registerForm.vehicleNumber.trim()
    ) {
      this.errorMessage = 'Please fill all required agent registration details.';
      return;
    }

    this.registering = true;

    this.deliveryService.registerAgent(this.registerForm).subscribe({
      next: () => {
        this.successMessage = 'Delivery agent registered successfully.';
        this.registering = false;
        this.loadAgentDashboard();
      },
      error: (err: any) => {
        this.registering = false;
        this.errorMessage = err?.error?.message || 'Unable to register as delivery agent.';
        this.cdr.detectChanges();
      }
    });
  }

  useCurrentLocation(): void {
    this.errorMessage = '';
    this.locationHelpMessage = '';

    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation is not supported in this browser.';
      return;
    }

    this.locating = true;
    this.locationHelpMessage = 'Fetching your current location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = Number(position.coords.latitude.toFixed(6));
        this.longitude = Number(position.coords.longitude.toFixed(6));
        this.locating = false;
        this.locationHelpMessage = 'Current location captured. Review it and update when ready.';
        this.cdr.detectChanges();
      },
      () => {
        this.locating = false;
        this.locationHelpMessage = '';
        this.errorMessage = 'Unable to fetch your current location. Check browser permissions and try again.';
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  onLocationInputChange(): void {
    this.locationHelpMessage = '';
  }

  updateLocation(): void {
    if (!this.agent) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (this.latitude === null || this.longitude === null) {
      this.errorMessage = 'Please enter both latitude and longitude.';
      return;
    }

    if (!this.isValidLatitude(this.latitude)) {
      this.errorMessage = 'Latitude must be between -90 and 90.';
      return;
    }

    if (!this.isValidLongitude(this.longitude)) {
      this.errorMessage = 'Longitude must be between -180 and 180.';
      return;
    }

    this.updatingLocation = true;

    this.deliveryService
      .updateLocation(this.agent.agentId, {
        currentLatitude: this.latitude,
        currentLongitude: this.longitude
      })
      .subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Location updated successfully.';
          this.updatingLocation = false;
          this.locationHelpMessage = '';
          this.loadAgentDashboard();
        },
        error: (err: any) => {
          this.updatingLocation = false;
          this.errorMessage = err?.error?.message || 'Unable to update location.';
          this.cdr.detectChanges();
        }
      });
  }

  toggleAvailability(): void {
    if (!this.agent) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.updatingAvailability = true;

    this.deliveryService
      .setAvailability(this.agent.agentId, {
        available: !this.agent.available
      })
      .subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Availability updated successfully.';
          this.updatingAvailability = false;
          this.loadAgentDashboard();
        },
        error: (err: any) => {
          this.updatingAvailability = false;
          this.errorMessage = err?.error?.message || 'Unable to update availability.';
          this.cdr.detectChanges();
        }
      });
  }

  pickupDelivery(orderId: number): void {
    if (!this.agent) return;

    this.runDeliveryTransition(
      orderId,
      this.deliveryService.pickupDelivery({
        agentId: this.agent.agentId,
        orderId
      }),
      'PICKED_UP',
      'Order picked up successfully.'
    );
  }

  completeDelivery(orderId: number): void {
    if (!this.agent) return;

    this.runDeliveryTransition(
      orderId,
      this.deliveryService.completeDelivery({
        agentId: this.agent.agentId,
        orderId
      }),
      'DELIVERED',
      'Delivery completed successfully.'
    );
  }

  getTripDistanceKm(delivery: DeliveryCard): number | null {
    if (
      !delivery.order ||
      !delivery.restaurant ||
      !this.hasCoordinates(delivery.restaurant.latitude, delivery.restaurant.longitude)
    ) {
      return null;
    }

    const pickupLatitude = delivery.restaurant.latitude as number;
    const pickupLongitude = delivery.restaurant.longitude as number;

    return this.calculateDistanceKm(
      pickupLatitude,
      pickupLongitude,
      delivery.order.deliveryLatitude,
      delivery.order.deliveryLongitude
    );
  }

  private runDeliveryTransition(
    orderId: number,
    deliveryRequest: ReturnType<DeliveryService['pickupDelivery']>,
    orderStatus: OrderStatus,
    successFallback: string
  ): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.processingDeliveryId = orderId;

    deliveryRequest
      .pipe(
        switchMap((deliveryResponse) =>
          this.orderService.updateOrderStatus(orderId, orderStatus).pipe(
            map(() => ({
              message: deliveryResponse.message || successFallback,
              orderStatusSynced: true,
              orderError: ''
            })),
            catchError((err) =>
              of({
                message: deliveryResponse.message || successFallback,
                orderStatusSynced: false,
                orderError: err?.error?.message || 'Order status sync is still pending.'
              })
            )
          )
        )
      )
      .subscribe({
        next: (result) => {
          this.processingDeliveryId = null;
          this.successMessage = result.orderStatusSynced
            ? result.message
            : `${result.message} ${result.orderError}`;
          this.loadAgentDashboard();
        },
        error: (err: any) => {
          this.processingDeliveryId = null;
          this.errorMessage = err?.error?.message || 'Unable to update delivery status.';
          this.cdr.detectChanges();
        }
      });
  }

  private hasCoordinates(
    latitude: number | null | undefined,
    longitude: number | null | undefined
  ): boolean {
    return latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
  }

  private isValidLatitude(value: number): boolean {
    return value >= -90 && value <= 90;
  }

  private isValidLongitude(value: number): boolean {
    return value >= -180 && value <= 180;
  }

  private calculateDistanceKm(
    startLatitude: number,
    startLongitude: number,
    endLatitude: number,
    endLongitude: number
  ): number {
    const earthRadiusKm = 6371;
    const latDistance = this.toRadians(endLatitude - startLatitude);
    const lngDistance = this.toRadians(endLongitude - startLongitude);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.toRadians(startLatitude)) *
        Math.cos(this.toRadians(endLatitude)) *
        Math.sin(lngDistance / 2) *
        Math.sin(lngDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
