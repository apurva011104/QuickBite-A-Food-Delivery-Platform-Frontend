import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Restaurants } from './pages/restaurants/restaurants';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Cart } from './pages/cart/cart';
import { RestaurantDetails } from './pages/restaurant-details/restaurant-details';
import { customerGuard } from './core/guards/customer.guard';
import { Checkout } from './pages/checkout/checkout';
import { OrderSuccess } from './pages/order-success/order-success';
import { OrderHistory } from './pages/order-history/order-history';
import { OrderTracking } from './pages/order-tracking/order-tracking';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'restaurants', component: Restaurants },
      { path: 'login', component: Login },
      { path: 'signup', component: Signup },
      { path: 'cart', component: Cart, canActivate: [customerGuard] },
      { path: 'restaurants/:id', component: RestaurantDetails },
      { path: 'checkout', component: Checkout, canActivate: [customerGuard] },
      { path: 'order-success/:id', component: OrderSuccess, canActivate: [customerGuard] },
      { path: 'orders', component: OrderHistory, canActivate: [customerGuard] },
{ path: 'orders/:id', component: OrderTracking, canActivate: [customerGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];