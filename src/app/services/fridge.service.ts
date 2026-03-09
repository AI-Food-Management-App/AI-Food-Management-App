import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type FridgeItem = {
  IngredientID: number;
  name: string;
  quantity: number;
  expiryDate: string | null;
  category: string;
  CategoryID: number;
  description?: string | null;
  tags?: string[] | null;
};

export type Category = {
  CategoryID: number;
  name: string;
};

@Injectable({ providedIn: "root" })
export class FridgeService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  getItems(categoryId?: number, search?: string, tag?: string): Observable<FridgeItem[]> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set("categoryId", String(categoryId));
    if (search) params = params.set("search", search);
    if (tag) params = params.set("tag", tag);

    return this.http.get<FridgeItem[]>(`${this.apiBaseUrl}/fridge/items`, { params });
  }

  adjustItem(
    name: string,
    quantityDelta: number = 1,
    expiryDate?: string | null,
    categoryId?: number | null,
    description?: string | null,
    tags?: string[]
  ): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/fridge/items`, {
      name,
      quantityDelta,
      expiryDate: expiryDate ?? null,
      CategoryID: categoryId ?? null,
      description: description ?? null,
      tags: tags ?? []
    });
  }

  updateItem(itemId: number, payload: {
    name?: string;
    quantity?: number;
    expiryDate?: string | null;
    CategoryID?: number;
    description?: string | null;
    tags?: string[];
  }): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}/fridge/items/${itemId}`, payload);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiBaseUrl}/fridge/categories`);
  }
}