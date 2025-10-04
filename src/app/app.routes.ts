import { Routes } from '@angular/router';
import { FoodComponent } from './featured/admin/food/food.component';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { UserComponent } from './featured/admin/user/user.component';
import { HomeComponent } from './featured/customer/home/home.component';
import { SellComponent } from './featured/staff/sell/sell.component';
import { MenuComponent } from './featured/customer/menu/menu.component';
import { CartComponent } from './featured/customer/cart/cart.component';

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
  }
];
