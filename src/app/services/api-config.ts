import { InjectionToken } from "@angular/core";
import { environment } from "../../environments/environment";

export type SpoonacularConfig = {
  baseUrl: string;
  apiKey: string;
};

export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL", {
  providedIn: "root",
  factory: () => environment.apiBaseUrl
});

export const SPOONACULAR_CONFIG = new InjectionToken<SpoonacularConfig>(
  "SPOONACULAR_CONFIG",
  {
    providedIn: "root",
    factory: () => environment.spoonacular
  }
);