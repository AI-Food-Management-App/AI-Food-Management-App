import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FoodApiService } from "../../services/api.service";
import { FavoriteRecipesService } from "../../services/favorite-recipes.service";
import { Recipe } from "../../interfaces/food-api-response";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-recipe-details",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./recipe-details.component.html"
})
export class RecipeDetailsComponent {
  userID = 1;

  loading = false;
  favLoading = false;
  error: string | null = null;

  recipe: Recipe | null = null;
  steps: { number: number; step: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private foodApi: FoodApiService,
    private favs: FavoriteRecipesService
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!id) return;

    this.loading = true;

    try {
      this.recipe = await firstValueFrom(
        this.foodApi.getRecipeById(id)
      );
      this.steps =
        this.recipe.analyzedInstructions?.[0]?.steps?.map(s => ({
          number: s.number,
          step: s.step
        })) ?? [];
    } catch (e: any) {
      this.error = e?.message || "Failed to load recipe";
    } finally {
      this.loading = false;
    }
  }

  async favorite() {
    if (!this.recipe) return;
    this.favLoading = true;
    await firstValueFrom(
      this.favs.addFavorite(
        this.userID,
        this.recipe.id,
        this.recipe.title,
        this.recipe.image
      )
    );
    this.favLoading = false;
  }

  async unfavorite() {
    if (!this.recipe) return;
    this.favLoading = true;
    await firstValueFrom(
      this.favs.removeFavorite(this.userID, this.recipe.id)
    );
    this.favLoading = false;
  }
}
