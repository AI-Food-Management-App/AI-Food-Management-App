import { Routes } from '@angular/router';
import { ShoppingListComponent } from "./components/shopping-list/shopping-list.component";
import { UploadComponent } from './components/upload/upload.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailsComponent } from './components/recipe-details/recipe-details.component';
import { FavouritesComponent } from './components/favourites/favourites.component';
import { SearchComponent } from './components/search/search.component';

// export const routes: Routes = [
//      { path: "shopping-list", component: ShoppingListComponent },
// ];

export const routes = [
  { path: "", component: UploadComponent },
  { path: "recipes", component: RecipeListComponent },
  { path: "recipe/:id", component: RecipeDetailsComponent },
  { path: "favorites", component: FavouritesComponent },
  { path: "shopping", component: ShoppingListComponent },
  { path: "search", component: SearchComponent },
];

