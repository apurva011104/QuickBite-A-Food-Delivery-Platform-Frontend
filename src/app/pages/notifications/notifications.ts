import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationResponse, NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications.html'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: NotificationResponse[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  private liveSub?: Subscription;

  constructor(
    public readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startLiveUpdates();
  }

  ngOnDestroy(): void {
    this.liveSub?.unsubscribe();
  }

  startLiveUpdates(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.liveSub?.unsubscribe();

    const source$ = this.authService.isAdmin()
      ? this.notificationService.getAllLive()
      : this.notificationService.getMyNotificationsLive();

    this.liveSub = source$.subscribe({
      next: (notifications: NotificationResponse[]) => {
        this.notifications = [...notifications].sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
        this.loading = false;
        window.dispatchEvent(new Event('storage'));
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load notifications.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNotifications(): void {
    this.startLiveUpdates();
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.successMessage = 'Notification marked as read.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to mark notification as read.';
        this.cdr.detectChanges();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.successMessage = 'All notifications marked as read.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to mark all notifications as read.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.successMessage = 'Notification deleted.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to delete notification.';
        this.cdr.detectChanges();
      }
    });
  }

  unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  getTypeClasses(type: string): string {
    switch (type) {
      case 'ORDER':
        return 'bg-orange-100 text-orange-700';
      case 'PAYMENT':
        return 'bg-green-100 text-green-700';
      case 'DELIVERY':
        return 'bg-blue-100 text-blue-700';
      case 'PROMO':
        return 'bg-purple-100 text-purple-700';
      case 'RESTAURANT':
        return 'bg-yellow-100 text-yellow-700';
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}