import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FoodApiService } from "../../services/api.service";
import { Recipe } from "../../interfaces/food-api-response";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./search.component.html"
})
export class SearchComponent {
  query = "";
  loading = false;
  error: string | null = null;
  recipes: Recipe[] = [];

  constructor(private foodApi: FoodApiService) {}

  async search() {
    this.loading = true;
    this.error = null;

    try {
      const ingredients = this.query.split(",").map(s => s.trim()).filter(Boolean);
      const resp = await firstValueFrom(
        this.foodApi.getRecipes(ingredients)
      );
      this.recipes = resp.results ?? [];
    } catch (e: any) {
      this.error = e?.message || "Search failed";
    } finally {
      this.loading = false;
    }
  }
}
