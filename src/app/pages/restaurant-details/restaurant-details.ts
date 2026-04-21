import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from '../../core/models/restaurant.model';
import { MenuCategory, MenuItem } from '../../core/models/menu-item.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

type DisplayMenuItem = MenuItem & { categoryName: string };

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-details.html'
})
export class RestaurantDetails implements OnInit {
  restaurant: Restaurant | undefined;
  menuItems: DisplayMenuItem[] = [];
  addedItemId: number | null = null;
  loginMessage = '';
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly menuService: MenuService,
    private readonly cartService: CartService,
    public readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    this.restaurantService.getRestaurantById(restaurantId).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
      },
      error: () => {
        this.errorMessage = 'Restaurant not found.';
        this.loading = false;
      }
    });

    this.menuService.getFullMenuByRestaurant(restaurantId).subscribe({
      next: (categories: MenuCategory[]) => {
        this.menuItems = categories.flatMap((category) =>
          category.items.map((item) => ({
            ...item,
            categoryName: category.name
          }))
        );
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load menu.';
        this.loading = false;
      }
    });
  }

  addToCart(item: DisplayMenuItem): void {
    if (!this.authService.isLoggedIn()) {
      this.loginMessage = 'Please login as a customer to add items to cart.';
      setTimeout(() => this.router.navigateByUrl('/login'), 800);
      return;
    }

    if (!this.authService.isCustomer()) {
      this.loginMessage = 'Only customer accounts can add items to cart.';
      return;
    }

    this.cartService.addItemToCart({
      menuItemId: item.itemId,
      quantity: 1
    }).subscribe({
      next: () => {
        this.loginMessage = '';
        this.addedItemId = item.itemId;
        setTimeout(() => {
          this.addedItemId = null;
        }, 1000);
      },
      error: () => {
        this.loginMessage = 'Unable to add item to cart.';
      }
    });
  }
}