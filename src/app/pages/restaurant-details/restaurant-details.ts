import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from '../../core/models/restaurant.model';
import { MenuItem } from '../../core/models/menu-item.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-details.html'
})
export class RestaurantDetails implements OnInit {
  restaurant: Restaurant | undefined;
  menuItems: MenuItem[] = [];
  addedItemId: number | null = null;
  loginMessage = '';

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
    this.restaurant = this.restaurantService.getRestaurantById(restaurantId);
    this.menuItems = this.menuService.getMenuByRestaurantId(restaurantId);
  }

  addToCart(item: MenuItem): void {
      if (!this.authService.isLoggedIn()) {
        this.loginMessage = 'Please login as a customer to add items to cart.';
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 800);
        return;
      }
  
      if (!this.authService.isCustomer()) {
        this.loginMessage = 'Only customer accounts can add items to cart.';
        return;
      }
  
      const result = this.cartService.addToCart(item);
  
      if (result.cartReset) {
        this.loginMessage = 'Cart was cleared because items can only be ordered from one restaurant at a time.';
      } else {
        this.loginMessage = '';
      }
  
      this.addedItemId = item.id;
  
      setTimeout(() => {
        this.addedItemId = null;
      }, 1000);
    }
}