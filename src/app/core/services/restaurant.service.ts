import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../models/restaurant.model';

export interface RestaurantRequest {
  name: string;
  description?: string;
  cuisine: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  deliveryRadius?: number;
  minOrderAmount?: number;
  estimatedDeliveryMin?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly baseUrl = `${environment.apiBaseUrl}/restaurants`;

  constructor(private readonly http: HttpClient) {}

  getRestaurants(): Observable<Restaurant[]> {
    const params = new HttpParams().set('keyword', '');
    return this.http.get<Restaurant[]>(`${this.baseUrl}/public/search`, { params });
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/public/${id}`);
  }

  registerRestaurant(payload: RestaurantRequest): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/owner/register`, payload);
  }

  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/owner/my`);
  }

  updateRestaurant(id: number, payload: RestaurantRequest): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/owner/update/${id}`, payload);
  }

  toggleRestaurant(id: number): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/owner/toggle/${id}`, {});
  }

  deleteRestaurant(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/owner/delete/${id}`, {
      responseType: 'text'
    });
  }

  getPendingRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/admin/pending`);
  }

  approveRestaurant(id: number): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/admin/approve/${id}`, {});
  }

  rejectRestaurant(id: number, reason: string): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/admin/reject/${id}`, { reason });
  }
}