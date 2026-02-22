import { Routes } from '@angular/router';
import { ShoppingListComponent } from "./components/shopping-list/shopping-list.component";
import { UploadComponent } from './components/upload/upload.component';
import { SearchComponent } from './components/search/search.component';

// export const routes: Routes = [
//      { path: "shopping-list", component: ShoppingListComponent },
// ];

export const routes = [
  { path: "", component: UploadComponent },
  { path: "shopping", component: ShoppingListComponent },
  { path: "search", component: SearchComponent },
];

