import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { MlService } from "../../services/ml.service";
import { FridgeService, Category } from "../../services/fridge.service";

type UploadQueueItem = {
  tempId: string;
  file: File;
  previewUrl: string;
  detectedName: string;
  editedName: string;
  quantity: number;
  categoryId: number | null;
  categoryName: string;
  status: "queued" | "detecting" | "detected" | "saving" | "saved" | "error";
  error: string | null;
};

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./upload.component.html",
  styleUrl: "./upload.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  queue: UploadQueueItem[] = [];

  loadingCategories = false;
  detecting = false;
  savingAll = false;

  error: string | null = null;
  success: string | null = null;

  constructor(
    private ml: MlService,
    private fridge: FridgeService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  ngOnDestroy() {
    this.queue.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }

  async loadCategories() {
    this.loadingCategories = true;
    this.cdr.markForCheck();

    try {
      this.categories = await firstValueFrom(this.fridge.getCategories());
    } catch (e: any) {
      console.error("Failed to load categories:", e);
    } finally {
      this.loadingCategories = false;
      this.cdr.markForCheck();
    }
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    this.error = null;
    this.success = null;

    const newItems: UploadQueueItem[] = files.map(file => ({
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      detectedName: "",
      editedName: "",
      quantity: 1,
      categoryId: null,
      categoryName: "Uncategorised",
      status: "queued",
      error: null
    }));

    this.queue = [...this.queue, ...newItems];
    input.value = "";
    this.cdr.markForCheck();
  }

  removeQueuedItem(item: UploadQueueItem) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    this.queue = this.queue.filter(q => q.tempId !== item.tempId);
    this.cdr.markForCheck();
  }

  async detectAll() {
    if (!this.queue.length) return;

    const queued = this.queue.filter(q => q.status === "queued" || q.status === "error");
    if (!queued.length) return;

    this.detecting = true;
    this.error = null;
    this.success = null;

    queued.forEach(item => {
      item.status = "detecting";
      item.error = null;
    });
    this.cdr.markForCheck();

    try {
      const files = queued.map(q => q.file);
      const resp = await firstValueFrom(this.ml.detectImages(files));
      const results = resp.results ?? [];

      queued.forEach((item, index) => {
        const result = results[index];

        if (!result || result.error) {
          item.status = "error";
          item.error = result?.error || "Detection failed";
          return;
        }

        item.detectedName = result.ingredient ?? "";
        item.editedName = result.ingredient ?? "";
        item.categoryId = result.categoryId ?? null;
        item.categoryName = result.categoryName ?? "Uncategorised";
        item.status = "detected";
        item.error = null;
      });

      const successCount = queued.filter(item => item.status === "detected").length;
      const failCount = queued.filter(item => item.status === "error").length;

      if (successCount > 0 && failCount > 0) {
        this.success = `Detection finished: ${successCount} succeeded, ${failCount} failed`;
        this.error = null;
      } else if (successCount > 0) {
        this.success = `Detection complete: ${successCount} item(s) detected`;
        this.error = null;
      } else {
        this.success = null;
        this.error = "Detection failed for all selected images";
      }
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Detection failed";
      this.success = null;

      queued.forEach(item => {
        item.status = "error";
        item.error = item.error || "Detection failed";
      });
    } finally {
      this.detecting = false;
      this.cdr.markForCheck();
    }
  }

  async saveOne(item: UploadQueueItem) {
    const name = item.editedName.trim();
    if (!name) {
      item.error = "Name is required";
      this.cdr.markForCheck();
      return;
    }

    item.status = "saving";
    item.error = null;
    this.cdr.markForCheck();

    try {
      await firstValueFrom(
        this.ml.saveSingleDetectedItem({
          name,
          quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
          CategoryID: item.categoryId
        })
      );

      item.status = "saved";
    } catch (e: any) {
      item.status = "error";
      item.error = e?.error?.error || e?.message || "Failed to save item";
    } finally {
      this.cdr.markForCheck();
    }
  }

  async saveAllDetected() {
    const ready = this.queue.filter(
      item => item.status === "detected" && item.editedName.trim()
    );

    if (!ready.length) return;

    this.savingAll = true;
    this.error = null;
    this.success = null;

    ready.forEach(item => {
      item.status = "saving";
      item.error = null;
    });
    this.cdr.markForCheck();

    try {
      await firstValueFrom(
        this.ml.saveDetectedItems(
          ready.map(item => ({
            name: item.editedName.trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
            CategoryID: item.categoryId
          }))
        )
      );

      ready.forEach(item => {
        item.status = "saved";
      });

      this.success = `${ready.length} item(s) saved to inventory`;
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to save detected items";
      ready.forEach(item => {
        if (item.status === "saving") item.status = "error";
      });
    } finally {
      this.savingAll = false;
      this.cdr.markForCheck();
    }
  }

  setCategoryName(item: UploadQueueItem) {
    const matched = this.categories.find(c => c.CategoryID === item.categoryId);
    item.categoryName = matched?.name ?? "Uncategorised";
  }

  trackByTempId(_: number, item: UploadQueueItem) {
    return item.tempId;
  }
}