import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../models/restaurant.model';

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
}