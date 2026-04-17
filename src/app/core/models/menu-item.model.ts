export interface MenuItem {
  id: number;
  restaurantId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  rating: number;
  image: string;
}