import { Injectable } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { MENU_ITEMS_MOCK } from '../mock-data/menu.mock';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  getMenuByRestaurantId(restaurantId: number): MenuItem[] {
    return MENU_ITEMS_MOCK.filter((item) => item.restaurantId === restaurantId);
  }

  getItemById(itemId: number): MenuItem | undefined {
    return MENU_ITEMS_MOCK.find((item) => item.id === itemId);
  }
}