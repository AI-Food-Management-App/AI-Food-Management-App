import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { UploadComponent } from './components/upload/upload.component';
import { SearchComponent } from './components/search/search.component';
import { ProfileComponent } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',         component: Home },
  { path: 'login',    component: LoginComponent },     
  { path: 'register', component: RegisterComponent },   
  { path: 'scan',     component: UploadComponent, canActivate: [authGuard] },
  { path: 'shopping', component: ShoppingListComponent, canActivate: [authGuard] },
  { path: 'search',   component: SearchComponent, canActivate: [authGuard] },
  { path: 'profile',  component: ProfileComponent, canActivate: [authGuard] },

  // Catch-all — redirect unknown paths to home
  { path: '**', redirectTo: '' }
];