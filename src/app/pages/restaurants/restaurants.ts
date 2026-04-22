import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { MenuService } from '../../core/services/menu.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurants.html'
})
export class Restaurants implements OnInit {
  restaurants: Restaurant[] = [];
  restaurantImages: { [key: number]: string } = {};

  loading = true;
  errorMessage = '';

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly menuService: MenuService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;

    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = [...restaurants];

        // fetch images for each restaurant
        this.restaurants.forEach((r) => {
          this.loadRestaurantImage(r.restaurantId);
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Unable to load restaurants.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRestaurantImage(restaurantId: number): void {
    this.menuService.getItemsByRestaurant(restaurantId).subscribe({
      next: (items) => {
        const firstImage = items.find(i => i.imageUrl)?.imageUrl;

        this.restaurantImages[restaurantId] =
          firstImage || 'https://via.placeholder.com/600x400?text=QuickBite';

        this.cdr.detectChanges();
      },
      error: () => {
        this.restaurantImages[restaurantId] =
          'https://via.placeholder.com/600x400?text=QuickBite';
      }
    });
  }

  getRestaurantImage(id: number): string {
    return this.restaurantImages[id] || 'https://via.placeholder.com/600x400?text=QuickBite';
  }
}