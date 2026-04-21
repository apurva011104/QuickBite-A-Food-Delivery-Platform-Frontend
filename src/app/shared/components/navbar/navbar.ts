import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit {
  mobileMenuOpen = false;
  currentUser: AuthResponse | null = null;
  cartCount = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCartCount();
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadUser();
    this.loadCartCount();
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
      next: (count) => {
        this.cartCount = count;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.cartCount = 0;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearAuthData();
        this.currentUser = null;
        this.cartCount = 0;
        this.mobileMenuOpen = false;
        this.router.navigateByUrl('/login');
      }
    });
  }
}