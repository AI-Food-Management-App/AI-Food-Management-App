import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type FavoriteRow = {
  id: number;
  name: string;
  image: string;
  favourite?: boolean | null;
};

@Injectable({ providedIn: "root" })
export class FavoritesService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  getFavorites(): Observable<FavoriteRow[]> {
    return this.http.get<FavoriteRow[]>(`${this.apiBaseUrl}/favorites`);
  }

  addFavorite(payload: FavoriteRow): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/favorites`, payload);
  }

  removeFavorite(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiBaseUrl}/favorites/${id}`);
  }
}
