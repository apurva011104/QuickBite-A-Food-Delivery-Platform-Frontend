export type NotificationType =
  | 'ORDER'
  | 'PAYMENT'
  | 'PROMO'
  | 'DELIVERY'
  | 'RESTAURANT'
  | 'ADMIN';

export type NotificationChannel = 'APP' | 'EMAIL' | 'SMS';

export interface Notification {
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