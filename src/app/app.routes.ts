import { Routes } from '@angular/router';
import { FoodComponent } from './featured/admin/food/food.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'admin/food', pathMatch: 'full'
    },
    {
        path: 'admin/food', component: FoodComponent
    }
];
