import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { Category, FridgeService, FridgeItem } from "../../services/fridge.service";

@Component({
  selector: "app-inventory",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./inventory.component.html",
  styleUrl: "./inventory.component.css",
})
export class InventoryComponent implements OnInit {
  fridgeItems: FridgeItem[] = [];
  categories: Category[] = [];

  invLoading = false;
  error: string | null = null;

  invSearch = "";
  invCategoryId: number | null = null;
  selectedTag = "";

  invNewName = "";
  invNewQty: number | null = 1;
  invNewCategoryId: number | null = null;
  invNewExpiryDate: string | null = null;
  invNewDescription = "";
  invNewTags = "";

  expandedItemId: number | null = null;

  constructor(private fridge: FridgeService) {}

  async ngOnInit() {
    await Promise.all([this.loadCategories()]);
    await this.loadInventory();
  }

  async loadCategories() {
    this.error = null;
    try {
      this.categories = await firstValueFrom(this.fridge.getCategories());
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load categories";
    }
  }

  async loadInventory() {
    this.invLoading = true;
    this.error = null;

    try {
      this.fridgeItems = await firstValueFrom(
        this.fridge.getItems(
          this.invCategoryId ?? undefined,
          this.invSearch || undefined,
          this.selectedTag || undefined
        )
      );
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load inventory";
    } finally {
      this.invLoading = false;
    }
  }

  async addInventoryManual() {
    const name = this.invNewName.trim();
    if (!name) return;

    const qty = Number(this.invNewQty ?? 1);
    const tags = this.parseTags(this.invNewTags);

    this.error = null;

    try {
      await firstValueFrom(
        this.fridge.adjustItem(
          name,
          Number.isFinite(qty) ? qty : 1,
          this.invNewExpiryDate,
          this.invNewCategoryId,
          this.invNewDescription,
          tags
        )
      );

      this.invNewName = "";
      this.invNewQty = 1;
      this.invNewCategoryId = null;
      this.invNewExpiryDate = null;
      this.invNewDescription = "";
      this.invNewTags = "";

      await this.loadInventory();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to add inventory item";
    }
  }

  async adjustQty(item: FridgeItem, delta: number) {
    this.error = null;
    try {
      await firstValueFrom(this.fridge.adjustItem(item.name, delta));
      await this.loadInventory();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to update quantity";
    }
  }

  toggleExpand(item: FridgeItem) {
    this.expandedItemId = this.expandedItemId === item.IngredientID ? null : item.IngredientID;
  }

  async saveItemDetails(item: FridgeItem) {
    this.error = null;
    try {
      await firstValueFrom(
        this.fridge.updateItem(item.IngredientID, {
          CategoryID: item.CategoryID,
          expiryDate: item.expiryDate,
          description: item.description ?? null,
          tags: item.tags ?? []
        })
      );
      await this.loadInventory();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to save item";
    }
  }

  parseTags(input: string): string[] {
    return input
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  tagsToString(tags?: string[] | null): string {
    return (tags ?? []).join(", ");
  }

  trackByItemId(_: number, item: FridgeItem) {
    return item.IngredientID;
  }
}