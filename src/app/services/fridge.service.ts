import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type FridgeItem = {
  IngredientID: number;
  name: string;
  quantity: number;
  category: string;
  tags: string[];
  CatalogueID: number;
};



@Injectable({ providedIn: "root" })
export class FridgeService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private apiBaseUrl: string) {}

  getItems(category?: string, search?: string): Observable<FridgeItem[]> {
  let params = new HttpParams();
  if (category) params = params.set("category", category);
  if (search) params = params.set("search", search);

  return this.http.get<FridgeItem[]>(`${this.apiBaseUrl}/fridge/items`, { params });
}

addItem(name: string, quantity = 1) {
  return this.http.post(`${this.apiBaseUrl}/fridge/items`, { name, quantity });
}
}
