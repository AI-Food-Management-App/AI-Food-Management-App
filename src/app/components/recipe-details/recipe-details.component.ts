import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FoodApiService } from '../../services/food-api.service';
import { Recipe } from '../../interfaces/food-api-response';

@Component({
    selector: 'app-recipe-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recipe-details.component.html',
    styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit {
    recipe: Recipe | null = null; // Ensure the recipe can be null initially
    isLoading: boolean = true; // Add a loading indicator
    hasError: boolean = false; // Add an error flag for better UX

    constructor(
        private route: ActivatedRoute,
        private foodApiService: FoodApiService,
    ) {}

    ngOnInit(): void {
        // Get the recipe ID from the route parameters
        const recipeId = Number(this.route.snapshot.paramMap.get('id'));

        // Fetch recipe details using the food API service
        this.foodApiService.getRecipeById(recipeId).subscribe({
            next: (data) => {
                console.log('Fetched recipe data:', data);
                this.recipe = this.processRecipeData(data);
                this.isLoading = false; 
            },
            error: (error) => {
                console.error('Error fetching recipe details:', error);
                this.hasError = true; 
                this.isLoading = false; 
            }
        });
    }

    getNutrientValue(nutrientName: string): string {
      const nutrient = this.recipe?.nutrition?.nutrients?.find(n => n.name === nutrientName);
      return nutrient ? `${nutrient.amount} ${nutrient.unit}` : 'N/A';
   }

    private processRecipeData(data: Recipe): Recipe {
        return {
            ...data,
            analyzedInstructions: data.analyzedInstructions?.map((instruction) => ({
                ...instruction,
                steps: instruction.steps?.map((step) => ({
                    ...step,
                    equipment: step.equipment || [], 
                    ingredients: step.ingredients || [] 
                })) || [] 
            })) || [] 
        };
    }
    get steps() {
  return this.recipe?.analyzedInstructions?.[0]?.steps ?? [];
}

}