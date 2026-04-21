export interface MenuItem {
  itemId: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice: number;
  imageUrl?: string;
  veg: boolean;
  calories: number;
  available: boolean;
  rating: number;
  tags: string[];
}

export interface MenuCategory {
  categoryId: number;
  restaurantId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  items: MenuItem[];
}