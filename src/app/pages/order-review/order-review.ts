import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderItemResponse, OrderResponse, OrderService } from '../../core/services/order.service';
import { ReviewResponse, ReviewService } from '../../core/services/review.service';

interface MenuItemReviewFormState {
  menuItemId: number;
  itemName: string;
  rating: number | null;
  comment: string;
}

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './order-review.html'
})
export class OrderReview implements OnInit {
  order: OrderResponse | null = null;
  existingReview: ReviewResponse | null = null;
  itemReviewForm: MenuItemReviewFormState[] = [];
  deliveryRating: number | null = null;
  deliveryComment = '';
  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  readonly ratingOptions = [1, 2, 3, 4, 5];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly reviewService: ReviewService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(orderId) || orderId <= 0) {
      this.errorMessage = 'Order not found.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadReviewContext(orderId);
  }

  get isDelivered(): boolean {
    return this.order?.orderStatus === 'DELIVERED';
  }

  get canSubmit(): boolean {
    return this.isDelivered
      && !this.existingReview
      && !this.submitting
      && this.deliveryRating !== null
      && this.itemReviewForm.length > 0
      && this.itemReviewForm.every((item) => item.rating !== null);
  }

  submitReview(): void {
    if (!this.order || !this.canSubmit || this.deliveryRating === null) {
      this.errorMessage = 'Please complete all menu item ratings and the delivery rating before submitting.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reviewService.submitReview({
      orderId: this.order.orderId,
      deliveryRating: this.deliveryRating,
      comment: this.deliveryComment.trim() || undefined,
      itemReviews: this.itemReviewForm.map((item) => ({
        menuItemId: item.menuItemId,
        rating: item.rating as number,
        comment: item.comment.trim() || undefined
      }))
    }).subscribe({
      next: (review) => {
        this.submitting = false;
        this.existingReview = review;
        this.successMessage = 'Your review has been submitted successfully.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Unable to submit your review.';
        this.cdr.detectChanges();
      }
    });
  }

  getSubmittedItemReview(menuItemId: number) {
    return this.existingReview?.itemReviews.find((item) => item.menuItemId === menuItemId) ?? null;
  }

  private loadReviewContext(orderId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.itemReviewForm = this.buildItemReviewForm(order.items);
        this.loadExistingReview(orderId);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Unable to load order details.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadExistingReview(orderId: number): void {
    this.reviewService.getReviewByOrderId(orderId).subscribe({
      next: (review) => {
        this.existingReview = review;
        this.deliveryRating = review.deliveryRating;
        this.deliveryComment = review.comment || '';
        this.itemReviewForm = this.itemReviewForm.map((item) => {
          const submittedItem = review.itemReviews.find(
            (reviewedItem) => reviewedItem.menuItemId === item.menuItemId
          );
          return submittedItem
            ? {
                ...item,
                rating: submittedItem.rating,
                comment: submittedItem.comment || ''
              }
            : item;
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err?.status && err.status !== 404) {
          this.errorMessage = err?.error?.message || 'Unable to load existing review details.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildItemReviewForm(orderItems: OrderItemResponse[]): MenuItemReviewFormState[] {
    const seenMenuItemIds = new Set<number>();

    return orderItems.reduce<MenuItemReviewFormState[]>((acc, item) => {
      if (!seenMenuItemIds.has(item.menuItemId)) {
        seenMenuItemIds.add(item.menuItemId);
        acc.push({
          menuItemId: item.menuItemId,
          itemName: item.name,
          rating: null,
          comment: ''
        });
      }
      return acc;
    }, []);
  }
}
