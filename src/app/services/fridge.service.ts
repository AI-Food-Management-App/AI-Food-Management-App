import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type FridgeItem = {
  IngredientID: number;
  name: string;
  quantity: number;
  expiryDate: string | null;
  category: string;   // category name e.g. "Dairy"
  CategoryID: number; // numeric ID
};

export type Category = { 
  CategoryID: number; 
  name: string 
};

@Injectable({ providedIn: "root" })
export class FridgeService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private apiBaseUrl: string) {}

  getItems(categoryId?: number, search?: string): Observable<FridgeItem[]> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set("categoryId", String(categoryId));
    if (search) params = params.set("search", search);
    return this.http.get<FridgeItem[]>(`${this.apiBaseUrl}/fridge/items`, { params });
  }

  /**
   * Add OR decrement inventory.
   * Send quantityDelta (positive or negative).
   */
  adjustItem(name: string, quantityDelta: number = 1, expiryDate?: string | null): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/fridge/items`, {
      name,
      quantityDelta,
      expiryDate: expiryDate ?? null
    });
  }

  getCategories(): Observable<Category[]> {
  return this.http.get<Category[]>(`${this.apiBaseUrl}/fridge/categories`);
}
  
}




