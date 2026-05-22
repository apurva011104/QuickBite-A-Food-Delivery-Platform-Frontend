import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MenuItemReviewRequest {
  menuItemId: number;
  rating: number;
  comment?: string;
}

export interface ReviewRequest {
  orderId: number;
  deliveryRating: number;
  comment?: string;
  itemReviews: MenuItemReviewRequest[];
}

export interface MenuItemReviewResponse {
  menuItemReviewId: number;
  orderId: number;
  menuItemId: number;
  itemName: string;
  rating: number;
  comment?: string;
  verified: boolean;
  reviewDate: string;
  updatedAt: string;
}

export interface MenuItemReviewSummaryResponse {
  menuItemId: number;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewResponse {
  reviewId: number;
  orderId: number;
  customerId: number;
  restaurantId: number;
  agentId: number;
  foodRating: number;
  deliveryRating: number;
  comment?: string;
  verified: boolean;
  reviewDate: string;
  updatedAt: string;
  itemReviews: MenuItemReviewResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/reviews`;

  constructor(private readonly http: HttpClient) {}

  submitReview(payload: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.baseUrl, payload);
  }

  getReviewByOrderId(orderId: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.baseUrl}/order/${orderId}`);
  }

  getMenuItemReviewSummary(menuItemId: number): Observable<MenuItemReviewSummaryResponse> {
    return this.http.get<MenuItemReviewSummaryResponse>(`${this.baseUrl}/menu-item/${menuItemId}/summary`);
  }
}
