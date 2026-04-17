import { Injectable } from '@angular/core';
import { Restaurant } from '../models/restaurant.model';
import { RESTAURANTS_MOCK } from '../mock-data/restaurants.mock';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  getAllRestaurants(): Restaurant[] {
    return RESTAURANTS_MOCK;
  }

  getRestaurantById(id: number): Restaurant | undefined {
    return RESTAURANTS_MOCK.find((restaurant) => restaurant.id === id);
  }

  getOpenRestaurants(): Restaurant[] {
    return RESTAURANTS_MOCK.filter((restaurant) => restaurant.isOpen);
  }
}