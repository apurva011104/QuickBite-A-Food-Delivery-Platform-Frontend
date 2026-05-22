import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Restaurants } from './pages/restaurants/restaurants';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Cart } from './pages/cart/cart';
import { RestaurantDetails } from './pages/restaurant-details/restaurant-details';
import { customerGuard } from './core/guards/customer.guard';
import { Checkout } from './pages/checkout/checkout';
import { OrderSuccess } from './pages/order-success/order-success';
import { OrderHistory } from './pages/order-history/order-history';
import { OrderTracking } from './pages/order-tracking/order-tracking';
import { OrderReview } from './pages/order-review/order-review';
import { ownerGuard } from './core/guards/owner.guard';
import { OwnerDashboard } from './pages/owner-dashboard/owner-dashboard';
import { OwnerMenu } from './pages/owner-menu/owner-menu';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { Notifications } from './pages/notifications/notifications';
import { AdminNotifications } from './pages/admin-notifications/admin-notifications';
import { authGuard } from './core/guards/auth.guard';
import { OAuthSuccess } from './pages/oauth-success/oauth-success';
import { Profile } from './pages/profile/profile';
import { DeliveryDashboard } from './pages/delivery-dashboard/delivery-dashboard';
import { agentGuard } from './core/guards/agent.guard';
import { AdminDelivery } from './pages/admin-delivery/admin-delivery';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'restaurants', component: Restaurants },
      { path: 'restaurants/:id', component: RestaurantDetails },
      { path: 'login', component: Login },
      { path: 'forgot-password', component: ForgotPassword },
      { path: 'signup', component: Signup },
      { path: 'cart', component: Cart, canActivate: [customerGuard] },
      { path: 'checkout', component: Checkout, canActivate: [customerGuard] },
      { path: 'order-success/:id', component: OrderSuccess, canActivate: [customerGuard] },
      { path: 'orders', component: OrderHistory, canActivate: [customerGuard] },
      { path: 'orders/:id/review', component: OrderReview, canActivate: [customerGuard] },
      { path: 'orders/:id', component: OrderTracking, canActivate: [customerGuard] },
      { path: 'owner', component: OwnerDashboard, canActivate: [ownerGuard] },
      { path: 'owner/menu', component: OwnerMenu, canActivate: [ownerGuard] },
      { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
      { path: 'notifications', component: Notifications, canActivate: [authGuard] },
      { path: 'admin/notifications', component: AdminNotifications, canActivate: [adminGuard] },
      { path: 'oauth-success', component: OAuthSuccess },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
      { path: 'delivery', component: DeliveryDashboard, canActivate: [agentGuard] },
      { path: 'admin/delivery', component: AdminDelivery, canActivate: [adminGuard]}
    ]
  },
  { path: '**', redirectTo: '' }
];
