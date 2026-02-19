import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { FoodApiResponse, Recipe } from "../interfaces/food-api-response";
import { API_BASE_URL } from "./api-config";

@Injectable({ providedIn: "root" })
export class FoodApiService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private apiBaseUrl: string) {}

  getRecipes(
    ingredients: string[],
    maxReadyTime?: number,
    intolerances?: string[],
    diet?: string
  ): Observable<FoodApiResponse> {
    let params = new HttpParams();

    if (ingredients.length) params = params.set("ingredients", ingredients.join(","));
    if (maxReadyTime) params = params.set("maxReadyTime", String(maxReadyTime));
    if (intolerances?.length) params = params.set("intolerances", intolerances.join(","));
    if (diet) params = params.set("diet", diet);

    return this.http.get<FoodApiResponse>(`${this.apiBaseUrl}/recipes`, { params });
  }

  getRecipeById(recipeId: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiBaseUrl}/recipes/${recipeId}`);
  }
}
