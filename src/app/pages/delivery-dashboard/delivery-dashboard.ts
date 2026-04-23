import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import {
  ActiveDeliveryResponse,
  DeliveryAgentRequest,
  DeliveryAgentResponse,
  DeliveryService,
  VehicleType
} from '../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-dashboard.html'
})
export class DeliveryDashboard implements OnInit {
  agent: DeliveryAgentResponse | null = null;
  activeDeliveries: ActiveDeliveryResponse[] = [];

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
  completingDeliveryId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly deliveryService: DeliveryService,
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
        this.activeDeliveries = [...deliveries];
        this.loading = false;
        this.cdr.detectChanges();
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

  updateLocation(): void {
    if (!this.agent) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (this.latitude === null || this.longitude === null) {
      this.errorMessage = 'Please enter both latitude and longitude.';
      return;
    }

    this.updatingLocation = true;

    this.deliveryService.updateLocation(this.agent.agentId, {
      currentLatitude: this.latitude,
      currentLongitude: this.longitude
    }).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Location updated successfully.';
        this.updatingLocation = false;
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

    this.deliveryService.setAvailability(this.agent.agentId, {
      available: !this.agent.available
    }).subscribe({
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

  completeDelivery(orderId: number): void {
    if (!this.agent) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.completingDeliveryId = orderId;

    this.deliveryService.completeDelivery({
      agentId: this.agent.agentId,
      orderId
    }).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Delivery completed successfully.';
        this.completingDeliveryId = null;
        this.loadAgentDashboard();
      },
      error: (err: any) => {
        this.completingDeliveryId = null;
        this.errorMessage = err?.error?.message || 'Unable to complete delivery.';
        this.cdr.detectChanges();
      }
    });
  }
}