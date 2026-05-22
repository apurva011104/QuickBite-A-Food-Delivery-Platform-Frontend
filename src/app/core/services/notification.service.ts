import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, startWith, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type NotificationType =
  | 'ORDER'
  | 'PAYMENT'
  | 'PROMO'
  | 'DELIVERY'
  | 'RESTAURANT'
  | 'ADMIN';

export type NotificationChannel = 'APP' | 'EMAIL' | 'SMS';

export interface NotificationResponse {
  notificationId: number;
  recipientId: number;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  sentAt: string;
}

export interface NotificationBulkRequest {
  recipientIds: number[];
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  relatedId?: number;
  relatedType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/notifications`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private get userId(): number | null {
    const user = this.authService.getLoggedInUser();
    return typeof user?.id === 'number' && user.id > 0 ? user.id : null;
  }

  getMyNotifications(): Observable<NotificationResponse[]> {
    if (this.userId === null) {
      return of([]);
    }

    return this.http.get<NotificationResponse[]>(
      `${this.baseUrl}/recipient/${this.userId}`
    );
  }

  getMyNotificationsLive(pollMs = 5000): Observable<NotificationResponse[]> {
    return interval(pollMs).pipe(
      startWith(0),
      switchMap(() => this.getMyNotifications())
    );
  }

  getUnreadCount(): Observable<number> {
    if (this.userId === null) {
      return of(0);
    }

    return this.http.get<number>(
      `${this.baseUrl}/recipient/${this.userId}/unread-count`
    );
  }

  getUnreadCountLive(pollMs = 5000): Observable<number> {
    return interval(pollMs).pipe(
      startWith(0),
      switchMap(() => this.getUnreadCount())
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${notificationId}/read`,
      { isRead: true }
    );
  }

  markAllAsRead(): Observable<any> {
    if (this.userId === null) {
      return of(null);
    }

    return this.http.put(
      `${this.baseUrl}/recipient/${this.userId}/read-all`,
      {}
    );
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${notificationId}`);
  }

  getAll(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.baseUrl);
  }

  getAllLive(pollMs = 5000): Observable<NotificationResponse[]> {
    return interval(pollMs).pipe(
      startWith(0),
      switchMap(() => this.getAll())
    );
  }

  sendBulk(payload: NotificationBulkRequest): Observable<NotificationResponse[]> {
    return this.http.post<NotificationResponse[]>(`${this.baseUrl}/bulk`, payload);
  }

  getNotificationActionLabel(notification: NotificationResponse): string {
    const route = this.getNotificationRoute(notification);

    if (route?.startsWith('/orders/')) {
      return 'Track Order';
    }

    switch (route) {
      case '/owner':
        return 'Open Owner Dashboard';
      case '/delivery':
        return 'Open Delivery Dashboard';
      case '/admin/notifications':
        return 'Open Admin Alerts';
      case '/notifications':
        return 'Open Notifications';
      default:
        return 'View Details';
    }
  }

  getNotificationRoute(notification: NotificationResponse): string | null {
    const role = this.authService.getLoggedInUser()?.role;
    if (!role) {
      return null;
    }

    if (notification.relatedType === 'ORDER' && notification.relatedId) {
      switch (role) {
        case 'CUSTOMER':
          return `/orders/${notification.relatedId}`;
        case 'OWNER':
          return '/owner';
        case 'AGENT':
          return '/delivery';
        case 'ADMIN':
          return '/admin/notifications';
        default:
          return '/notifications';
      }
    }

    if (notification.type === 'DELIVERY' && role === 'AGENT') {
      return '/delivery';
    }

    if (role === 'ADMIN') {
      return '/admin/notifications';
    }

    return '/notifications';
  }
}
