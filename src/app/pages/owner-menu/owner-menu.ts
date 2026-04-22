import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../core/models/restaurant.model';
import { MenuCategory, MenuItem } from '../../core/models/menu-item.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import {
  CategoryRequest,
  MenuItemRequest,
  MenuService
} from '../../core/services/menu.service';
import { ImageUploadService } from '../../core/services/image-upload.service';

@Component({
  selector: 'app-owner-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-menu.html'
})
export class OwnerMenu implements OnInit {
  restaurants: Restaurant[] = [];
  categories: MenuCategory[] = [];
  items: MenuItem[] = [];

  selectedRestaurantId: number | null = null;

  categoryForm: CategoryRequest = {
    restaurantId: 0,
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 1
  };

  itemForm: MenuItemRequest = {
    restaurantId: 0,
    categoryId: 0,
    name: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    imageUrl: '',
    isVeg: true,
    calories: 0,
    tags: []
  };

  tagsInput = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  categoryUploading = false;
  itemUploading = false;

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly menuService: MenuService,
    private readonly imageUploadService: ImageUploadService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.errorMessage = '';

    this.restaurantService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = [...restaurants];
        const approvedRestaurants = restaurants.filter((r) => r.approved);

        if (approvedRestaurants.length > 0) {
          const nextRestaurantId =
            this.selectedRestaurantId && approvedRestaurants.some((r) => r.restaurantId === this.selectedRestaurantId)
              ? this.selectedRestaurantId
              : approvedRestaurants[0].restaurantId;

          this.selectRestaurant(nextRestaurantId);
        } else {
          this.categories = [];
          this.items = [];
          this.selectedRestaurantId = null;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load restaurants.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectRestaurant(restaurantId: number): void {
    this.selectedRestaurantId = restaurantId;
    this.categoryForm.restaurantId = restaurantId;
    this.itemForm.restaurantId = restaurantId;
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    if (!this.selectedRestaurantId) return;

    this.menuService.getCategoriesByRestaurant(this.selectedRestaurantId).subscribe({
      next: (categories) => {
        this.categories = [...categories];

        if (
          categories.length &&
          !categories.some((c) => c.categoryId === this.itemForm.categoryId)
        ) {
          this.itemForm.categoryId = categories[0].categoryId;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load categories.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadItems(): void {
    if (!this.selectedRestaurantId) return;

    this.menuService.getItemsByRestaurant(this.selectedRestaurantId).subscribe({
      next: (items) => {
        this.items = [...items];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to load menu items.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCategoryFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.errorMessage = '';
    this.categoryUploading = true;

    this.imageUploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.categoryForm.imageUrl = res.secure_url;
        this.categoryUploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to upload category image.';
        this.categoryUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onItemFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.errorMessage = '';
    this.itemUploading = true;

    this.imageUploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.itemForm.imageUrl = res.secure_url;
        this.itemUploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to upload item image.';
        this.itemUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitCategory(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedRestaurantId || !this.categoryForm.name.trim()) {
      this.errorMessage = 'Please select a restaurant and enter category name.';
      return;
    }

    this.categoryForm.restaurantId = this.selectedRestaurantId;

    this.menuService.addCategory(this.categoryForm).subscribe({
      next: () => {
        this.successMessage = 'Category added successfully.';
        this.categoryForm = {
          restaurantId: this.selectedRestaurantId!,
          name: '',
          description: '',
          imageUrl: '',
          displayOrder: 1
        };
        this.loadCategories();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to add category.';
        this.cdr.detectChanges();
      }
    });
  }

  submitMenuItem(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.selectedRestaurantId ||
      !this.itemForm.categoryId ||
      !this.itemForm.name.trim()
    ) {
      this.errorMessage = 'Please fill the required menu item fields.';
      return;
    }

    this.itemForm.restaurantId = this.selectedRestaurantId;
    this.itemForm.tags = this.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    this.menuService.addMenuItem(this.itemForm).subscribe({
      next: () => {
        this.successMessage = 'Menu item added successfully.';
        this.itemForm = {
          restaurantId: this.selectedRestaurantId!,
          categoryId: this.categories.length ? this.categories[0].categoryId : 0,
          name: '',
          description: '',
          price: 0,
          discountedPrice: 0,
          imageUrl: '',
          isVeg: true,
          calories: 0,
          tags: []
        };
        this.tagsInput = '';
        this.loadItems();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to add menu item.';
        this.cdr.detectChanges();
      }
    });
  }

  get approvedRestaurants(): Restaurant[] {
    return this.restaurants.filter((r) => r.approved);
  }

  get selectedRestaurantName(): string {
    return this.restaurants.find((r) => r.restaurantId === this.selectedRestaurantId)?.name || '';
  }

  categoryNameById(categoryId: number): string {
    return this.categories.find((c) => c.categoryId === categoryId)?.name || `Category ${categoryId}`;
  }
}