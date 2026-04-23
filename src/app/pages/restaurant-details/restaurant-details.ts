import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../core/models/restaurant.model';
import { MenuCategory, MenuItem } from '../../core/models/menu-item.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './restaurant-details.html'
})
export class RestaurantDetails implements OnInit {
  restaurant: Restaurant | undefined;
  menuItems: MenuItem[] = [];
  fullMenu: MenuCategory[] = [];
  restaurantImage = 'https://via.placeholder.com/1200x500?text=QuickBite';
  addedItemId: number | null = null;
  loginMessage = '';
  loading = true;
  errorMessage = '';

  searchText = '';
  foodType: 'ALL' | 'VEG' | 'NON_VEG' = 'ALL';
  maxPrice: number | null = null;
  selectedCategoryId: number | 'ALL' = 'ALL';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly menuService: MenuService,
    private readonly cartService: CartService,
    public readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurantDetails(restaurantId);
  }

  loadRestaurantDetails(restaurantId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.restaurantService.getRestaurantById(restaurantId).subscribe({
      next: (restaurant: Restaurant) => {
        this.restaurant = restaurant;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Restaurant not found.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.menuService.getFullMenuByRestaurant(restaurantId).subscribe({
      next: (categories: MenuCategory[]) => {
        this.fullMenu = [...categories];
        this.menuItems = categories.flatMap((category) => category.items || []);

        const firstImage = this.menuItems.find((item) => item.imageUrl)?.imageUrl;
        this.restaurantImage =
          firstImage || 'https://via.placeholder.com/1200x500?text=QuickBite';

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Unable to load menu.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredItems(): MenuItem[] {
    return this.menuItems.filter((item) => {
      const matchesSearch =
        !this.searchText.trim() ||
        item.name.toLowerCase().includes(this.searchText.trim().toLowerCase());

      const matchesFoodType =
        this.foodType === 'ALL' ||
        (this.foodType === 'VEG' && item.veg) ||
        (this.foodType === 'NON_VEG' && !item.veg);

      const itemPrice = item.discountedPrice || item.price;
      const matchesPrice =
        this.maxPrice === null || itemPrice <= this.maxPrice;

      const matchesCategory =
        this.selectedCategoryId === 'ALL' || item.categoryId === this.selectedCategoryId;

      return matchesSearch && matchesFoodType && matchesPrice && matchesCategory;
    });
  }

  addToCart(item: MenuItem): void {
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
        this.cdr.detectChanges();

        setTimeout(() => {
          this.addedItemId = null;
          this.cdr.detectChanges();
        }, 1000);
      },
      error: (err: any) => {
        this.loginMessage = err?.error?.message || 'Unable to add item to cart.';
        this.cdr.detectChanges();
      }
    });
  }
}