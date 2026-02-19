import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FavoriteRecipesService, FavoriteRecipeRow } from "../../services/favorite-recipes.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-favourites",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./favourites.component.html"
})
export class FavouritesComponent {
  userID = 1;
  loading = false;
  error: string | null = null;
  favorites: FavoriteRecipeRow[] = [];

  constructor(private favs: FavoriteRecipesService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.favorites = await firstValueFrom(
        this.favs.getFavorites(this.userID)
      );
    } catch (e: any) {
      this.error = e?.message || "Failed to load favorites";
    } finally {
      this.loading = false;
    }
  }

  async remove(recipeId: number) {
    await firstValueFrom(this.favs.removeFavorite(this.userID, recipeId));
    await this.load();
  }
}

