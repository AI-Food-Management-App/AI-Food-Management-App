import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { shareReplay, tap } from "rxjs/operators";
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
  private openList$?: Observable<ShoppingList | null>;
  private history$?: Observable<ShoppingList[]>;
  private listItemsCache = new Map<number, Observable<ShoppingItem[]>>();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  getOpenList(forceRefresh = false): Observable<ShoppingList | null> {
    if (!this.openList$ || forceRefresh) {
      this.openList$ = this.http
        .get<ShoppingList | null>(`${this.apiBaseUrl}/shopping-lists/open`)
        .pipe(shareReplay(1));
    }
    return this.openList$;
  }

  getHistory(forceRefresh = false): Observable<ShoppingList[]> {
    if (!this.history$ || forceRefresh) {
      this.history$ = this.http
        .get<ShoppingList[]>(`${this.apiBaseUrl}/shopping-lists/history`)
        .pipe(shareReplay(1));
    }
    return this.history$;
  }

  createList(name: string): Observable<ShoppingList> {
    return this.http
      .post<ShoppingList>(`${this.apiBaseUrl}/shopping-lists`, { name })
      .pipe(
        tap(() => {
          this.invalidateOpenList();
          this.invalidateHistory();
        })
      );
  }

  getList(listID: number, forceRefresh = false): Observable<ShoppingItem[]> {
    if (!this.listItemsCache.has(listID) || forceRefresh) {
      const req$ = this.http
        .get<ShoppingItem[]>(`${this.apiBaseUrl}/shopping-lists/${listID}`)
        .pipe(shareReplay(1));

      this.listItemsCache.set(listID, req$);
    }

    return this.listItemsCache.get(listID)!;
  }

  getHistoryListItems(listID: number, forceRefresh = false): Observable<ShoppingItem[]> {
    return this.getList(listID, forceRefresh);
  }

  addItem(listID: number, name: string, quantity?: number | null) {
    return this.http
      .post(`${this.apiBaseUrl}/shopping-lists/${listID}/items`, {
        name,
        quantity: quantity ?? 1
      })
      .pipe(
        tap(() => {
          this.invalidateListItems(listID);
        })
      );
  }

  toggleItem(listID: number, itemID: number, checked: boolean) {
    return this.http
      .patch(`${this.apiBaseUrl}/shopping-lists/${listID}/items/${itemID}`, {
        checked
      })
      .pipe(
        tap(() => {
          this.invalidateListItems(listID);
        })
      );
  }

  deleteItem(listID: number, itemID: number) {
    return this.http
      .delete(`${this.apiBaseUrl}/shopping-lists/${listID}/items/${itemID}`)
      .pipe(
        tap(() => {
          this.invalidateListItems(listID);
        })
      );
  }

  confirmChecked(listID: number) {
    return this.http
      .post<{ ok: true; moved: number; message?: string }>(
        `${this.apiBaseUrl}/shopping-lists/${listID}/confirm`,
        {}
      )
      .pipe(
        tap(() => {
          this.invalidateListItems(listID);
        })
      );
  }

  closeList(listID: number) {
    return this.http
      .patch<{ ok: true; list: ShoppingList }>(
        `${this.apiBaseUrl}/shopping-lists/${listID}/close`,
        {}
      )
      .pipe(
        tap(() => {
          this.invalidateOpenList();
          this.invalidateHistory();
          this.invalidateListItems(listID);
        })
      );
  }

  invalidateOpenList() {
    this.openList$ = undefined;
  }

  invalidateHistory() {
    this.history$ = undefined;
  }

  invalidateListItems(listID: number) {
    this.listItemsCache.delete(listID);
  }

  invalidateAll() {
    this.openList$ = undefined;
    this.history$ = undefined;
    this.listItemsCache.clear();
  }
}