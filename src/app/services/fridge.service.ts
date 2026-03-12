import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { shareReplay, tap } from "rxjs/operators";
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
  private categories$?: Observable<Category[]>;
  private itemsCache = new Map<string, Observable<FridgeItem[]>>();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  private buildItemsCacheKey(categoryId?: number, search?: string, tag?: string): string {
    return JSON.stringify({
      categoryId: categoryId ?? null,
      search: search ?? "",
      tag: tag ?? ""
    });
  }

  getItems(
    categoryId?: number,
    search?: string,
    tag?: string,
    forceRefresh = false
  ): Observable<FridgeItem[]> {
    const cacheKey = this.buildItemsCacheKey(categoryId, search, tag);

    if (!this.itemsCache.has(cacheKey) || forceRefresh) {
      let params = new HttpParams();
      if (categoryId != null) params = params.set("categoryId", String(categoryId));
      if (search) params = params.set("search", search);
      if (tag) params = params.set("tag", tag);

      const req$ = this.http
        .get<FridgeItem[]>(`${this.apiBaseUrl}/fridge/items`, { params })
        .pipe(shareReplay(1));

      this.itemsCache.set(cacheKey, req$);
    }

    return this.itemsCache.get(cacheKey)!;
  }

  adjustItem(
    name: string,
    quantityDelta: number = 1,
    expiryDate?: string | null,
    categoryId?: number | null,
    description?: string | null,
    tags?: string[]
  ): Observable<any> {
    return this.http
      .post(`${this.apiBaseUrl}/fridge/items`, {
        name,
        quantityDelta,
        expiryDate: expiryDate ?? null,
        CategoryID: categoryId ?? null,
        description: description ?? null,
        tags: tags ?? []
      })
      .pipe(
        tap(() => {
          this.invalidateItems();
        })
      );
  }

  updateItem(itemId: number, payload: {
    name?: string;
    quantity?: number;
    expiryDate?: string | null;
    CategoryID?: number;
    description?: string | null;
    tags?: string[];
  }): Observable<any> {
    return this.http
      .patch(`${this.apiBaseUrl}/fridge/items/${itemId}`, payload)
      .pipe(
        tap(() => {
          this.invalidateItems();
        })
      );
  }

  getCategories(forceRefresh = false): Observable<Category[]> {
    if (!this.categories$ || forceRefresh) {
      this.categories$ = this.http
        .get<Category[]>(`${this.apiBaseUrl}/fridge/categories`)
        .pipe(shareReplay(1));
    }

    return this.categories$;
  }

  invalidateItems() {
    this.itemsCache.clear();
  }

  invalidateCategories() {
    this.categories$ = undefined;
  }

  invalidateAll() {
    this.itemsCache.clear();
    this.categories$ = undefined;
  }
}