import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CartItemRequest,
  CartItemResponse,
  CartRequest,
  CartResponse
} from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = `${environment.apiBaseUrl}/cart`;

  constructor(private readonly http: HttpClient) {}

  getMyCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/me`);
  }

  addItemToCart(payload: CartItemRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseUrl}/add`, payload);
  }

  removeItemFromCart(itemId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/remove/${itemId}`, {
      responseType: 'text'
    });
  }

  updateCartItemQuantity(itemId: number, quantity: number): Observable<CartItemResponse> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.put<CartItemResponse>(`${this.baseUrl}/update/${itemId}`, {}, { params });
  }

  clearCart(): Observable<string> {
    return this.http.delete(`${this.baseUrl}/clear`, {
      responseType: 'text'
    });
  }

  changeRestaurant(payload: CartRequest): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseUrl}/change-restaurant`, payload);
  }

  applyPromoCode(promoCode: string): Observable<CartResponse> {
    const params = new HttpParams().set('promoCode', promoCode);
    return this.http.post<CartResponse>(`${this.baseUrl}/apply-promo`, {}, { params });
  }

  getCartCount(): Observable<number> {
    return this.getMyCart().pipe(
      map((cart) => cart.cartItems.reduce((sum, item) => sum + item.quantity, 0))
    );
  }
}