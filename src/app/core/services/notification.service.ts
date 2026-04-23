import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
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

  private get userId(): number {
    const user = this.authService.getLoggedInUser();
    return user?.id ?? 0;
  }

  getMyNotifications(): Observable<NotificationResponse[]> {
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
}