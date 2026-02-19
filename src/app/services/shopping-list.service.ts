import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type ShoppingItem = {
  itemID: number;
  ingredientID: number;
  name: string;
  quantity: number | null;
  checked: boolean;
};

@Injectable({ providedIn: "root" })
export class ShoppingListService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  createList(): Observable<{ listID: number }> {
    return this.http.post<{ listID: number }>(`${this.apiBaseUrl}/shopping-lists`, {  });
  }

  getList(listID: number): Observable<ShoppingItem[]> {
    return this.http.get<ShoppingItem[]>(`${this.apiBaseUrl}/shopping-lists/${listID}`);
  }

  addItem(listID: number, name: string, quantity?: number | null) {
    return this.http.post(`${this.apiBaseUrl}/shopping-lists/${listID}/items`, {
      
      name,
      quantity: quantity ?? null
    });
  }

  toggleItem(listID: number, itemID: number, checked: boolean) {
    return this.http.patch(`${this.apiBaseUrl}/shopping-lists/${listID}/items/${itemID}`, {
      checked
    });
  }

  deleteItem(listID: number, itemID: number) {
    return this.http.delete(`${this.apiBaseUrl}/shopping-lists/${listID}/items/${itemID}`);
  }
}
