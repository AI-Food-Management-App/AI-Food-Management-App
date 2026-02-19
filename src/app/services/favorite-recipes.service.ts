import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type FavoriteRecipeRow = {
  recipeId: number;
  title: string;
  image: string | null;
  createdAt?: string;
};

@Injectable({ providedIn: "root" })
export class FavoriteRecipesService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private apiBaseUrl: string) {}

  getFavorites(userID: number): Observable<FavoriteRecipeRow[]> {
    const params = new HttpParams().set("userID", String(userID));
    return this.http.get<FavoriteRecipeRow[]>(`${this.apiBaseUrl}/favorite-recipes`, { params });
  }

  addFavorite(userID: number, recipeId: number, title: string, image?: string | null) {
    return this.http.post(`${this.apiBaseUrl}/favorite-recipes`, {
      userID,
      recipeId,
      title,
      image: image ?? null
    });
  }

  removeFavorite(userID: number, recipeId: number) {
    const params = new HttpParams().set("userID", String(userID));
    return this.http.delete(`${this.apiBaseUrl}/favorite-recipes/${recipeId}`, { params });
  }
}
