import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FoodApiService } from "../../services/api.service";
import { FridgeService } from "../../services/fridge.service";
import { Recipe } from "../../interfaces/food-api-response";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-recipe-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./recipe-list.component.html"
})
export class RecipeListComponent {
  userID = 1;
  loading = false;
  error: string | null = null;

  ingredientsUsed: string[] = [];
  recipes: Recipe[] = [];

  constructor(
    private foodApi: FoodApiService,
    private fridge: FridgeService
  ) {}

  async loadFromFridge() {
    this.loading = true;
    this.error = null;

    try {
      const items = await firstValueFrom(this.fridge.getItems(this.userID));
      this.ingredientsUsed = items.map(i => i.name);
      const resp = await firstValueFrom(
        this.foodApi.getRecipes(this.ingredientsUsed)
      );
      this.recipes = resp.results ?? [];
    } catch (e: any) {
      this.error = e?.message || "Failed to load recipes";
    } finally {
      this.loading = false;
    }
  }
}
