import { Routes } from '@angular/router';
import { ShoppingListComponent } from "./components/shopping-list/shopping-list.component";
import { UploadComponent } from './components/upload/upload.component';
import { SearchComponent } from './components/search/search.component';
import { Home } from './components/home/home';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Profile } from './components/profile/profile';

// export const routes: Routes = [
//      { path: "shopping-list", component: ShoppingListComponent },
// ];

export const routes = [
  { path: "", component: Home },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: "scan", component: UploadComponent ,canActivate: [authGuard] }, // ML page
  { path: "shopping", component: ShoppingListComponent ,canActivate: [authGuard]},
  { path: "search", component: SearchComponent ,canActivate: [authGuard]},
  { path: 'profile',  component: Profile,canActivate: [authGuard] },
];

