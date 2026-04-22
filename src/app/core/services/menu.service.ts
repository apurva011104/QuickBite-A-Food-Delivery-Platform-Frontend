import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuCategory, MenuItem } from '../models/menu-item.model';

export interface CategoryRequest {
  restaurantId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface MenuItemRequest {
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice: number;
  imageUrl?: string;
  isVeg: boolean;
  calories: number;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly baseUrl = `${environment.apiBaseUrl}/menu`;

  constructor(private readonly http: HttpClient) {}

  getFullMenuByRestaurant(restaurantId: number): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/restaurant/${restaurantId}`);
  }

  getMenuItemById(itemId: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.baseUrl}/item/${itemId}`);
  }

  getCategoriesByRestaurant(restaurantId: number): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/categories/restaurant/${restaurantId}`);
  }

  getItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/items/restaurant/${restaurantId}`);
  }

  addCategory(payload: CategoryRequest): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(`${this.baseUrl}/category`, payload);
  }

  addMenuItem(payload: MenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.baseUrl}/item`, payload);
  }
}