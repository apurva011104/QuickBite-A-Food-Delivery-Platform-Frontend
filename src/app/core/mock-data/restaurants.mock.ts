import { Restaurant } from '../models/restaurant.model';

export const RESTAURANTS_MOCK: Restaurant[] = [
  {
    id: 1,
    name: 'Pizza Hub',
    cuisine: 'Italian',
    rating: 4.6,
    deliveryTime: '25-30 min',
    deliveryFee: 'Free delivery',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    offer: '40% OFF up to ₹80',
    isOpen: true
  },
  {
    id: 2,
    name: 'Burger Blast',
    cuisine: 'American',
    rating: 4.4,
    deliveryTime: '20-25 min',
    deliveryFee: '₹30 delivery',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    offer: 'Buy 1 Get 1',
    isOpen: true
  },
  {
    id: 3,
    name: 'Spice Route',
    cuisine: 'Indian',
    rating: 4.7,
    deliveryTime: '30-35 min',
    deliveryFee: 'Free delivery',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
    offer: 'Flat ₹100 OFF',
    isOpen: true
  },
  {
    id: 4,
    name: 'Green Bowl',
    cuisine: 'Healthy',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: '₹25 delivery',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    offer: 'Healthy Picks',
    isOpen: true
  },
  {
    id: 5,
    name: 'Wok Express',
    cuisine: 'Chinese',
    rating: 4.3,
    deliveryTime: '25-35 min',
    deliveryFee: '₹35 delivery',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    offer: '20% OFF',
    isOpen: false
  },
  {
    id: 6,
    name: 'Sweet Slice',
    cuisine: 'Desserts',
    rating: 4.8,
    deliveryTime: '15-20 min',
    deliveryFee: 'Free delivery',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
    offer: 'Sweet Treats',
    isOpen: true
  }
];