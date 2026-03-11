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

export type ShoppingList = {
  listID: number;
  name: string;
  status: "open" | "closed";
  createdAt?: string;
  closedAt?: string | null;
};

@Injectable({ providedIn: "root" })
export class ShoppingListService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  getOpenList(): Observable<ShoppingList | null> {
    return this.http.get<ShoppingList | null>(`${this.apiBaseUrl}/shopping-lists/open`);
  }

  getHistory(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(`${this.apiBaseUrl}/shopping-lists/history`);
  }

  createList(name: string): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(`${this.apiBaseUrl}/shopping-lists`, { name });
  }

  getList(listID: number): Observable<ShoppingItem[]> {
    return this.http.get<ShoppingItem[]>(`${this.apiBaseUrl}/shopping-lists/${listID}`);
  }

  getHistoryListItems(listID: number): Observable<ShoppingItem[]> {
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

  confirmChecked(listID: number) {
    return this.http.post<{ ok: true; moved: number; message?: string }>(
      `${this.apiBaseUrl}/shopping-lists/${listID}/confirm`,
      {}
    );
  }

  closeList(listID: number) {
    return this.http.patch<{ ok: true; list: ShoppingList }>(
      `${this.apiBaseUrl}/shopping-lists/${listID}/close`,
      {}
    );
  }
}