import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MlService } from "../../services/ml.service";
import { FridgeService, FridgeItem } from "../../services/fridge.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./upload.component.html"
})
export class UploadComponent {
  userID = 1;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  loading = false;
  error: string | null = null;
  detectedIngredient: string | null = null;

  fridgeItems: FridgeItem[] = [];
  loadingFridge = false;

  constructor(private ml: MlService, private fridge: FridgeService) {}

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
      const resp = await firstValueFrom(
        this.ml.detectAndSave(this.selectedFile, this.userID)
      );
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
    try {
      this.fridgeItems = await firstValueFrom(
        this.fridge.getItems(this.userID)
      );
    } finally {
      this.loadingFridge = false;
    }
  }
}
