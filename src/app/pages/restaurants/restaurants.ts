import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurants.html'
})
export class Restaurants implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load restaurants.';
        this.loading = false;
      }
    });
  }
}