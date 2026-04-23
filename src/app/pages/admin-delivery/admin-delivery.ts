import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DeliveryAgentResponse,
  DeliveryService
} from '../../core/services/delivery.service';

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-delivery.html'
})
export class AdminDelivery implements OnInit {
  verifiedAgents: DeliveryAgentResponse[] = [];
  availableAgents: DeliveryAgentResponse[] = [];

  verificationAgentId: number | null = null;
  selectedAgentId: number | null = null;
  orderId: number | null = null;

  loading = true;
  assigning = false;
  verifying = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly deliveryService: DeliveryService,
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

  assignOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedAgentId || !this.orderId) {
      this.errorMessage = 'Select an agent and enter an order ID.';
      return;
    }

    this.assigning = true;

    this.deliveryService.assignOrder(this.selectedAgentId, this.orderId).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Order assigned successfully.';
        this.assigning = false;
        this.orderId = null;
        this.loadDashboard();
      },
      error: (err: any) => {
        this.assigning = false;
        this.errorMessage = err?.error?.message || 'Unable to assign order.';
        this.cdr.detectChanges();
      }
    });
  }
}