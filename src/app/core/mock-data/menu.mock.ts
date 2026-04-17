import { MenuItem } from '../models/menu-item.model';

export const MENU_ITEMS_MOCK: MenuItem[] = [
  {
    id: 1,
    restaurantId: 1,
    category: 'Pizza',
    name: 'Margherita Pizza',
    description: 'Classic cheese pizza with tomato base.',
    price: 249,
    isVeg: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    restaurantId: 1,
    category: 'Pizza',
    name: 'Farmhouse Pizza',
    description: 'Loaded with veggies and cheese.',
    price: 329,
    isVeg: true,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    restaurantId: 2,
    category: 'Burger',
    name: 'Classic Cheeseburger',
    description: 'Juicy patty with cheese and lettuce.',
    price: 199,
    isVeg: false,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80'
  }
];