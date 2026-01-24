import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { FoodApiResponse, Recipe } from '../interfaces/food-api-response';
import { SPOONACULAR_CONFIG, SpoonacularConfig} from '../services/api-config'

@Injectable({ providedIn: 'root' })
export class FoodApiService {
  private readonly complexSearchUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(SPOONACULAR_CONFIG) private spoonacular: SpoonacularConfig
  ) {
    this.complexSearchUrl = `${this.spoonacular.baseUrl}/recipes/complexSearch`;
  }

  getRecipes(
    ingredients: string[],
    maxReadyTime?: number,
    intolerances?: string[],
    diet?: string
  ): Observable<FoodApiResponse> {
    let params = new HttpParams()
      .set('apiKey', this.spoonacular.apiKey)
      .set('addRecipeInformation', 'true')
      .set('addNutritionInformation', 'true');

    if (ingredients.length > 0) params = params.set('includeIngredients', ingredients.join(','));
    if (maxReadyTime) params = params.set('maxReadyTime', maxReadyTime.toString());
    if (intolerances?.length) params = params.set('intolerances', intolerances.join(','));
    if (diet) params = params.set('diet', diet);

    return this.http.get<FoodApiResponse>(this.complexSearchUrl, { params }).pipe(
      tap((response) => {
        response.results.forEach((recipe) => {
          recipe.nutrition = recipe.nutrition || {
            calories: 'N/A',
            protein: 'N/A',
            carbs: 'N/A',
            fat: 'N/A',
            nutrients: []
          };
        });
      }),
      map((response) => response),
      catchError(this.handleError)
    );
  }

  getRecipeById(recipeId: number): Observable<Recipe> {
    const url = `${this.spoonacular.baseUrl}/recipes/${recipeId}/information`;
    return this.http.get<Recipe>(url, {
      params: new HttpParams()
        .set("apiKey", this.spoonacular.apiKey)
        .set("includeNutrition", "true")
    }).pipe(
      tap((data) => console.log('Recipe details response:', data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage =
      error.error instanceof ErrorEvent
        ? `Error: ${error.error.message}`
        : `Error Code: ${error.status}\nMessage: ${error.message}`;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
