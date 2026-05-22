import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationResponse, NotificationService } from '../../../core/services/notification.service';
import { AuthResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  notificationsOpen = false;
  currentUser: AuthResponse | null = null;
  cartCount = 0;
  unreadNotifications = 0;
  recentNotifications: NotificationResponse[] = [];

  private unreadSub?: Subscription;
  private notificationsSub?: Subscription;

  constructor(
    public readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCartCount();
    this.startUnreadNotifications();
    this.startRecentNotifications();
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
    this.notificationsSub?.unsubscribe();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadUser();
    this.loadCartCount();
    this.startUnreadNotifications();
    this.startRecentNotifications();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.notificationsOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  loadUser(): void {
    this.currentUser = this.authService.getLoggedInUser();
  }

  loadCartCount(): void {
    if (!this.authService.isCustomer()) {
      this.cartCount = 0;
      return;
    }

    this.cartService.getCartCount().subscribe({
      next: (count: number) => {
        this.cartCount = count;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  startUnreadNotifications(): void {
    this.unreadSub?.unsubscribe();

    if (!this.authService.isLoggedIn() || this.authService.isAdmin()) {
      this.unreadNotifications = 0;
      return;
    }

    this.unreadSub = this.notificationService.getUnreadCountLive().subscribe({
      next: (count: number) => {
        this.unreadNotifications = count;
      },
      error: () => {
        this.unreadNotifications = 0;
      }
    });
  }

  startRecentNotifications(): void {
    this.notificationsSub?.unsubscribe();

    if (!this.authService.isLoggedIn() || this.authService.isAdmin()) {
      this.recentNotifications = [];
      this.notificationsOpen = false;
      return;
    }

    this.notificationsSub = this.notificationService.getMyNotificationsLive().subscribe({
      next: (notifications: NotificationResponse[]) => {
        this.recentNotifications = [...notifications]
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, 5);
      },
      error: () => {
        this.recentNotifications = [];
      }
    });
  }

  toggleNotificationsPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  closeNotificationsPanel(): void {
    this.notificationsOpen = false;
  }

  openNotification(notification: NotificationResponse): void {
    const route = this.notificationService.getNotificationRoute(notification);
    if (!route) {
      return;
    }

    const navigate = () => {
      this.notificationsOpen = false;
      void this.router.navigateByUrl(route);
    };

    if (notification.isRead) {
      navigate();
      return;
    }

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
        window.dispatchEvent(new Event('storage'));
        navigate();
      },
      error: () => {
        navigate();
      }
    });
  }

  getNotificationActionLabel(notification: NotificationResponse): string {
    return this.notificationService.getNotificationActionLabel(notification);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.cartCount = 0;
        this.unreadNotifications = 0;
        this.recentNotifications = [];
        this.notificationsOpen = false;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearAuthData();
        this.currentUser = null;
        this.cartCount = 0;
        this.unreadNotifications = 0;
        this.recentNotifications = [];
        this.notificationsOpen = false;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      }
    });
  }
}
