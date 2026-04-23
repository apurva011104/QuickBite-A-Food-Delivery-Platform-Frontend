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
    veg: true,
    calories: 0,
    tags: []
  };

  editingCategoryId: number | null = null;
  editingItemId: number | null = null;

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
    this.resetCategoryForm();
    this.resetItemForm();
    this.categoryForm.restaurantId = restaurantId;
    this.itemForm.restaurantId = restaurantId;
    this.loadCategories();
    this.loadItems();
  }

  refreshCurrentRestaurantData(): void {
    if (!this.selectedRestaurantId) return;
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

    const request$ = this.editingCategoryId
      ? this.menuService.updateCategory(this.editingCategoryId, this.categoryForm)
      : this.menuService.addCategory(this.categoryForm);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingCategoryId
          ? 'Category updated successfully.'
          : 'Category added successfully.';
        this.resetCategoryForm();
        this.refreshCurrentRestaurantData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to save category.';
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

    const request$ = this.editingItemId
      ? this.menuService.updateMenuItem(this.editingItemId, this.itemForm)
      : this.menuService.addMenuItem(this.itemForm);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingItemId
          ? 'Menu item updated successfully.'
          : 'Menu item added successfully.';
        this.resetItemForm();
        this.refreshCurrentRestaurantData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to save menu item.';
        this.cdr.detectChanges();
      }
    });
  }

  editCategory(category: MenuCategory): void {
    this.editingCategoryId = category.categoryId;
    this.categoryForm = {
      restaurantId: category.restaurantId,
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      displayOrder: category.displayOrder
    };
    this.cdr.detectChanges();
  }

  deleteCategory(categoryId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.menuService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully.';
        if (this.editingCategoryId === categoryId) {
          this.resetCategoryForm();
        }
        this.refreshCurrentRestaurantData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to delete category.';
        this.cdr.detectChanges();
      }
    });
  }

  editItem(item: MenuItem): void {
    this.editingItemId = item.itemId;
    this.itemForm = {
      restaurantId: item.restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      discountedPrice: item.discountedPrice,
      imageUrl: item.imageUrl || '',
      veg: item.veg,
      calories: item.calories,
      tags: item.tags || []
    };
    this.tagsInput = (item.tags || []).join(', ');
    this.cdr.detectChanges();
  }

  deleteItem(itemId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.menuService.deleteMenuItem(itemId).subscribe({
      next: () => {
        this.successMessage = 'Menu item deleted successfully.';
        if (this.editingItemId === itemId) {
          this.resetItemForm();
        }
        this.refreshCurrentRestaurantData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to delete menu item.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleItemAvailability(item: MenuItem): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.menuService.toggleAvailability(item.itemId, !item.available).subscribe({
      next: () => {
        this.successMessage = 'Item availability updated successfully.';
        this.refreshCurrentRestaurantData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to update item availability.';
        this.cdr.detectChanges();
      }
    });
  }

  resetCategoryForm(): void {
    this.editingCategoryId = null;
    this.categoryForm = {
      restaurantId: this.selectedRestaurantId || 0,
      name: '',
      description: '',
      imageUrl: '',
      displayOrder: 1
    };
  }

  resetItemForm(): void {
    this.editingItemId = null;
    this.itemForm = {
      restaurantId: this.selectedRestaurantId || 0,
      categoryId: this.categories.length ? this.categories[0].categoryId : 0,
      name: '',
      description: '',
      price: 0,
      discountedPrice: 0,
      imageUrl: '',
      veg: true,
      calories: 0,
      tags: []
    };
    this.tagsInput = '';
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