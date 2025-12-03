import { Routes } from '@angular/router';
import { FoodComponent } from './featured/admin/food/food.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { UserComponent } from './featured/admin/user/user.component';
import { HomeComponent } from './featured/customer/home/home.component';
import { SellComponent } from './featured/staff/sell/sell.component';
import { MenuComponent } from './featured/customer/menu/menu.component';
import { CartComponent } from './featured/customer/cart/cart.component';
import { OrderTrackingComponent } from './featured/customer/order-tracking/order-tracking.component';
import { OrderComponent } from './featured/admin/order/order.component';
import { PaymentSuccessComponent } from './featured/customer/payment-success/payment-success.component';
import { PaymentCancelComponent } from './featured/customer/payment-cancel/payment-cancel.component';
import { ProfileComponent } from './featured/customer/profile/profile.component';
import { PromotionComponent } from './featured/admin/promotion/promotion.component';
import { ReviewComponent } from './featured/admin/review/review.component';

export const routes: Routes = [

    
  {
    path: '',
    redirectTo: 'customer/home',
    pathMatch: 'full'
  },
  {
    path: 'customer',
    redirectTo: 'customer/home',
    pathMatch: 'full'
  },
  {
    path: 'staff',
    redirectTo: 'staff/sell',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    redirectTo: 'admin/food',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  //CUSTOMER
  {
    path: 'customer/home',
    component: HomeComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] } 
  },
  {
    path: 'customer/menu',
    component: MenuComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] } 
  },
  {
    path: 'customer/cart',
    component: CartComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] } 
  },
  {
    path: 'customer/orders/:orderId',
    component: OrderTrackingComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] }
  },
  {
    path: 'customer/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] }
  },
  // PAYMENT CALLBACKS
  {
    path: 'payment/success',
    component: PaymentSuccessComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] }
  },
  {
    path: 'payment/cancel',
    component: PaymentCancelComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CUSTOMER','STAFF'] }
  },
  //STAFF
  {
    path: 'staff/sell',
    component: SellComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN','STAFF'] } 
  },
  //ADMIN
  {
    path: 'admin/food',
    component: FoodComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }   
  },
  {
    path: 'admin/user',
    component: UserComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }          
  },
  {
    path: 'admin/order',
    component: OrderComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }   
  },
  {
    path: 'admin/promotion',
    component: PromotionComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }   
  },
  {
    path: 'admin/review',
    component: ReviewComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }  
  }
];
