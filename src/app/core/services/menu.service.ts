import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  veg: boolean;
  calories: number;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly baseUrl = `${environment.apiBaseUrl}/menu`;

  constructor(private readonly http: HttpClient) {}

  addCategory(payload: CategoryRequest): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(`${this.baseUrl}/category`, payload);
  }

  getCategoryById(id: number): Observable<MenuCategory> {
    return this.http.get<MenuCategory>(`${this.baseUrl}/category/${id}`);
  }

  getCategoriesByRestaurant(restaurantId: number): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/categories/restaurant/${restaurantId}`);
  }

  updateCategory(id: number, payload: CategoryRequest): Observable<MenuCategory> {
    return this.http.put<MenuCategory>(`${this.baseUrl}/category/${id}`, payload);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/category/${id}`, {
      responseType: 'text'
    });
  }

  addMenuItem(payload: MenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.baseUrl}/item`, payload);
  }

  getMenuItemById(itemId: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.baseUrl}/item/${itemId}`);
  }

  getItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/items/restaurant/${restaurantId}`);
  }

  getItemsByCategory(categoryId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/items/category/${categoryId}`);
  }

  updateMenuItem(id: number, payload: MenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/item/${id}`, payload);
  }

  toggleAvailability(id: number, available: boolean): Observable<MenuItem> {
    const params = new HttpParams().set('available', available);
    return this.http.patch<MenuItem>(`${this.baseUrl}/item/${id}/availability`, {}, { params });
  }

  deleteMenuItem(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/item/${id}`, {
      responseType: 'text'
    });
  }

  getFullMenuByRestaurant(restaurantId: number): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.baseUrl}/restaurant/${restaurantId}`);
  }

  searchMenuItems(query: string): Observable<MenuItem[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<MenuItem[]>(`${this.baseUrl}/search`, { params });
  }

  getVegItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/veg`);
  }

  getNonVegItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/non-veg`);
  }

  getItemsBelowPrice(price: number): Observable<MenuItem[]> {
    const params = new HttpParams().set('price', price);
    return this.http.get<MenuItem[]>(`${this.baseUrl}/price`, { params });
  }
}