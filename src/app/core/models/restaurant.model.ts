export interface Restaurant {
  restaurantId: number;
  ownerId?: number;
  name: string;
  description?: string;
  cuisine: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  avgRating?: number;
  open: boolean;
  approved: boolean;
  deliveryRadius?: number;
  minOrderAmount?: number;
  estimatedDeliveryMin?: number;
  rejectionReason?: string | null;
  ratingCount?: number;
}