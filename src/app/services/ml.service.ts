import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "./api-config";

export type DetectResponse = {
  ingredient: string | null;
  error?: string;
};

@Injectable({ providedIn: "root" })
export class MlService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string
  ) {}

  detectFood(file: File): Observable<DetectResponse> {
    const form = new FormData();
    form.append("image", file); // must match multer field name
    return this.http.post<DetectResponse>(`${this.apiBaseUrl}/detect-image`, form);
  }

detectAndSave(file: File, userID: number) {
  const form = new FormData();
  form.append("image", file);
  form.append("userID", String(userID));
  return this.http.post<{ ok: boolean; ingredient: string | null; saved: boolean; error?: string }>(
    `${this.apiBaseUrl}/detect-and-save`,
    form
  );
}

}
