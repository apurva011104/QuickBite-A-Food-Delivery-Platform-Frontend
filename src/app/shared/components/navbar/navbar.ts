import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  currentUser: AuthResponse | null = null;
  cartCount = 0;
  unreadNotifications = 0;

  private unreadSub?: Subscription;

  constructor(
    public readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCartCount();
    this.startUnreadNotifications();
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadUser();
    this.loadCartCount();
    this.startUnreadNotifications();
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

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.cartCount = 0;
        this.unreadNotifications = 0;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearAuthData();
        this.currentUser = null;
        this.cartCount = 0;
        this.unreadNotifications = 0;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      }
    });
  }
}