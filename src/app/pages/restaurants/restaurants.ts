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

  constructor(private readonly restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.restaurants = this.restaurantService.getAllRestaurants();
  }
}