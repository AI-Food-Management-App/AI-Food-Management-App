import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { MlService } from "../../services/ml.service";
import { FridgeService, FridgeItem, Category } from "../../services/fridge.service";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./upload.component.html",
})
export class UploadComponent implements OnInit {
  userID = 1;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  search = "";
  selectedCategoryId: number | null = null;
  categories: Category[] = [];

  loading = false;
  loadingFridge = false;
  loadingCategories = false;

  error: string | null = null;
  detectedIngredient: string | null = null;

  fridgeItems: FridgeItem[] = [];

  constructor(private ml: MlService, private fridge: FridgeService) {}

  async ngOnInit() {
    await Promise.all([this.loadCategories(), this.loadFridge()]);
  }

  async loadCategories() {
    this.loadingCategories = true;
    try {
      this.categories = await firstValueFrom(this.fridge.getCategories());
    } catch (e: any) {
      // don’t block the page if categories fail
      console.error("Failed to load categories:", e);
    } finally {
      this.loadingCategories = false;
    }
  }

  onFile(event: Event) {
    this.error = null;
    this.detectedIngredient = null;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  async detectAndSave() {
    if (!this.selectedFile) return;

    this.loading = true;
    this.error = null;

    try {
      const resp = await firstValueFrom(this.ml.detectAndSave(this.selectedFile, this.userID));
      this.detectedIngredient = resp.ingredient;
      await this.loadFridge();
    } catch (e: any) {
      this.error = e?.message || "Detection failed";
    } finally {
      this.loading = false;
    }
  }

  async loadFridge() {
    this.loadingFridge = true;
    this.error = null;

    try {
      this.fridgeItems = await firstValueFrom(
        this.fridge.getItems(this.selectedCategoryId ?? undefined, this.search || undefined)
      );
    } catch (e: any) {
      this.error = e?.message || "Failed to load fridge";
    } finally {
      this.loadingFridge = false;
    }
  }
}