import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type DetectBatchItem = {
  tempId: string;
  originalFilename: string;
  ingredient: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  quantity?: number;
  error?: string | null;
};

export type DetectBatchResponse = {
  ok: boolean;
  results: DetectBatchItem[];
};

export type SaveDetectedItem = {
  name: string;
  quantity?: number;
  CategoryID?: number | null;
};

@Injectable({ providedIn: "root" })
export class MlService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  detectImages(files: File[]): Observable<DetectBatchResponse> {
    const form = new FormData();
    files.forEach(file => form.append("images", file));
    return this.http.post<DetectBatchResponse>(`${this.apiBaseUrl}/detect-images`, form);
  }

  saveDetectedItems(items: SaveDetectedItem[]) {
    return this.http.post<{ ok: boolean; savedCount: number }>(
      `${this.apiBaseUrl}/save-detected-items`,
      { items }
    );
  }

  saveSingleDetectedItem(item: SaveDetectedItem) {
    return this.http.post<{ ok: boolean; saved: boolean }>(
      `${this.apiBaseUrl}/save-detected-items`,
      { items: [item] }
    );
  }
}