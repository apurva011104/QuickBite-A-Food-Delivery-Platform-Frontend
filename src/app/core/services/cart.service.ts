import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartStorageKey = 'quickbite_cart';

  getCartItems(): CartItem[] {
    const raw = localStorage.getItem(this.cartStorageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  }

  saveCartItems(items: CartItem[]): void {
    localStorage.setItem(this.cartStorageKey, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  }

  addToCart(menuItem: MenuItem): { cartReset: boolean } {
    let items = this.getCartItems();
    let cartReset = false;

    if (items.length > 0) {
      const currentRestaurantId = items[0].restaurantId;

      if (currentRestaurantId !== menuItem.restaurantId) {
        items = [];
        cartReset = true;
      }
    }

    const existingItem = items.find((item) => item.menuItemId === menuItem.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({
        id: Date.now(),
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      });
    }

    this.saveCartItems(items);
    return { cartReset };
  }

  removeFromCart(menuItemId: number): void {
    const updatedItems = this.getCartItems().filter((item) => item.menuItemId !== menuItemId);
    this.saveCartItems(updatedItems);
  }

  clearCart(): void {
    localStorage.removeItem(this.cartStorageKey);
    window.dispatchEvent(new Event('storage'));
  }

  getCartCount(): number {
    return this.getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartRestaurantId(): number | null {
    const items = this.getCartItems();
    return items.length ? items[0].restaurantId : null;
  }
}