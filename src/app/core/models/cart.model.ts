export interface CartItemRequest {
  menuItemId: number;
  quantity: number;
  customization?: string;
}

export interface CartRequest {
  restaurantId: number;
}

export interface CartItemResponse {
  itemId: number;
  cartId: number;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  customization?: string;
}

export interface CartResponse {
  cartId: number;
  customerId: number;
  restaurantId: number;
  totalPrice: number;
  cartItems: CartItemResponse[];
}