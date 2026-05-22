import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReviewService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should submit a review payload', () => {
    const payload = {
      orderId: 100,
      deliveryRating: 4,
      comment: 'Fast handoff',
      itemReviews: [
        { menuItemId: 501, rating: 5, comment: 'Great taste' }
      ]
    };

    service.submitReview(payload).subscribe();

    const req = httpMock.expectOne((request) =>
      request.method === 'POST' && request.url.endsWith('/api/v1/reviews')
    );
    expect(req.request.body).toEqual(payload);
    req.flush({
      reviewId: 1,
      orderId: 100,
      customerId: 7,
      restaurantId: 11,
      agentId: 22,
      foodRating: 5,
      deliveryRating: 4,
      comment: 'Fast handoff',
      verified: false,
      reviewDate: '2026-05-22T10:00:00',
      updatedAt: '2026-05-22T10:00:00',
      itemReviews: []
    });
  });

  it('should fetch a review by order id', () => {
    service.getReviewByOrderId(100).subscribe((response) => {
      expect(response.orderId).toBe(100);
      expect(response.itemReviews.length).toBe(1);
    });

    const req = httpMock.expectOne((request) =>
      request.method === 'GET' && request.url.endsWith('/api/v1/reviews/order/100')
    );
    req.flush({
      reviewId: 1,
      orderId: 100,
      customerId: 7,
      restaurantId: 11,
      agentId: 22,
      foodRating: 5,
      deliveryRating: 4,
      comment: 'Fast handoff',
      verified: false,
      reviewDate: '2026-05-22T10:00:00',
      updatedAt: '2026-05-22T10:00:00',
      itemReviews: [
        {
          menuItemReviewId: 9,
          orderId: 100,
          menuItemId: 501,
          itemName: 'Paneer Wrap',
          rating: 5,
          comment: 'Great taste',
          verified: false,
          reviewDate: '2026-05-22T10:00:00',
          updatedAt: '2026-05-22T10:00:00'
        }
      ]
    });
  });

  it('should fetch a menu item review summary', () => {
    service.getMenuItemReviewSummary(501).subscribe((response) => {
      expect(response.menuItemId).toBe(501);
      expect(response.averageRating).toBe(4.5);
      expect(response.reviewCount).toBe(6);
    });

    const req = httpMock.expectOne((request) =>
      request.method === 'GET' && request.url.endsWith('/api/v1/reviews/menu-item/501/summary')
    );
    req.flush({
      menuItemId: 501,
      averageRating: 4.5,
      reviewCount: 6
    });
  });
});
