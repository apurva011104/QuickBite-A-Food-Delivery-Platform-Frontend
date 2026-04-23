import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NotificationBulkRequest,
  NotificationService
} from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-notifications.html'
})
export class AdminNotifications {
  form: NotificationBulkRequest = {
    recipientIds: [],
    type: 'PROMO',
    title: '',
    message: '',
    channel: 'APP'
  };

  recipientIdsText = '';
  errorMessage = '';
  successMessage = '';
  submitting = false;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  sendBulk(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.title.trim() || !this.form.message.trim()) {
      this.errorMessage = 'Please fill in title and message.';
      return;
    }

    this.form.recipientIds = this.recipientIdsText
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id) && id > 0);

    this.submitting = true;

    this.notificationService.sendBulk(this.form).subscribe({
      next: () => {
        this.successMessage = 'Notification broadcast sent successfully.';
        this.submitting = false;
        this.form = {
          recipientIds: [],
          type: 'PROMO',
          title: '',
          message: '',
          channel: 'APP'
        };
        this.recipientIdsText = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to send notification.';
        this.cdr.detectChanges();
      }
    });
  }
}