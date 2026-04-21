import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuCategory, MenuItem } from '../models/menu-item.model';

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
}