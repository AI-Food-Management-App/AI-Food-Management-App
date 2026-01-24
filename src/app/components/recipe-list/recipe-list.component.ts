import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { UploadComponent } from '../upload/upload.component';
import { Recipe } from '../../interfaces/food-api-response';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchComponent, UploadComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})
export class RecipeListComponent {
  @Input() recipes: Recipe[] = [];
  @Input() errorMessage: string = '';
  autoFillIngredients: string[] = [];

  constructor(private favoritesService: FavoritesService) {}

  onRecipeSelected(recipe: Recipe): void {
    console.log('Selected recipe:', recipe);
  }

  onSearch(recipes: Recipe[]): void {
    this.recipes = recipes;
  }

  onIngredientsFromImage(ingredients: string[]) {
    this.autoFillIngredients = ingredients;
  }

  addToFavourites(recipe: any): void {
    // Map spoonacular recipe -> your DB schema
    const payload = {
      id: recipe.id,
      name: recipe.title ?? recipe.name ?? "Unknown",
      image: recipe.image ?? ""
    };

    this.favoritesService.addFavorite(payload).subscribe({
      next: () => alert('Recipe added to favorites!'),
      error: (err) => console.error('Failed to save favorite:', err)
    });
  }

  removeFromFavourites(recipe: any): void {
    this.favoritesService.removeFavorite(recipe.id).subscribe({
      next: () => alert('Recipe removed from favorites!'),
      error: (err) => console.error('Failed to remove favorite:', err)
    });
  }
}
