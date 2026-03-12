import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { UploadComponent } from './components/upload/upload.component';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';
import { InventoryComponent } from './components/inventory/inventory.component';

export const routes: Routes = [
  { path: '',         component: Home },
  { path: 'login',    component: LoginComponent },     
  { path: 'register', component: RegisterComponent },   
  { path: 'scan',     component: UploadComponent, canActivate: [authGuard] },
  { path: 'shopping', component: ShoppingListComponent, canActivate: [authGuard] },
  { path: 'profile',  component: ProfileComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },


  // { path: 'scan',     component: UploadComponent },
  // { path: 'shopping', component: ShoppingListComponent },
  // { path: 'profile',  component: ProfileComponent},
  // { path: 'inventory', component: InventoryComponent, },
  // Catch-all — redirect unknown paths to home
  { path: '**', redirectTo: '' }
];