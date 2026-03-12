import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.OnPush
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
  savingItemIds = new Set<number>();
  adjustingItemIds = new Set<number>();
  addingInventory = false;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private fridge: FridgeService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadCategories()]);
    await this.loadInventory();
  }

  async loadCategories() {
    this.error = null;
    this.cdr.markForCheck();

    try {
      this.categories = await firstValueFrom(this.fridge.getCategories());
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load categories";
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadInventory() {
    this.invLoading = true;
    this.error = null;
    this.cdr.markForCheck();

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
      this.cdr.markForCheck();
    }
  }

  onSearchChange() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.loadInventory();
    }, 300);
  }

  async onCategoryChange(categoryId: number | null) {
    this.invCategoryId = categoryId;
    await this.loadInventory();
  }

  async addInventoryManual() {
    const name = this.invNewName.trim();
    if (!name) return;

    this.addingInventory = true;
    this.error = null;
    this.cdr.markForCheck();

    try {
      const qty = Number(this.invNewQty ?? 1);
      const tags = this.parseTags(this.invNewTags);

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

      await this.loadInventory();

      this.invNewName = "";
      this.invNewQty = 1;
      this.invNewCategoryId = null;
      this.invNewExpiryDate = null;
      this.invNewDescription = "";
      this.invNewTags = "";
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to add inventory item";
    } finally {
      this.addingInventory = false;
      this.cdr.markForCheck();
    }
  }

  async adjustQty(item: FridgeItem, delta: number) {
    if (this.adjustingItemIds.has(item.IngredientID)) return;

    this.adjustingItemIds.add(item.IngredientID);
    this.error = null;

    const previousQty = item.quantity;
    item.quantity = Math.max(0, (item.quantity ?? 0) + delta);
    this.cdr.markForCheck();

    try {
      await firstValueFrom(this.fridge.adjustItem(item.name, delta));
    } catch (e: any) {
      item.quantity = previousQty;
      this.error = e?.error?.error || e?.message || "Failed to update quantity";
    } finally {
      this.adjustingItemIds.delete(item.IngredientID);
      this.cdr.markForCheck();
    }
  }

  toggleExpand(item: FridgeItem) {
    this.expandedItemId = this.expandedItemId === item.IngredientID ? null : item.IngredientID;
    this.cdr.markForCheck();
  }

  async saveItemDetails(item: FridgeItem) {
    if (this.savingItemIds.has(item.IngredientID)) return;

    this.savingItemIds.add(item.IngredientID);
    this.error = null;
    this.cdr.markForCheck();

    try {
      await firstValueFrom(
        this.fridge.updateItem(item.IngredientID, {
          CategoryID: item.CategoryID,
          expiryDate: item.expiryDate,
          description: item.description ?? null,
          tags: item.tags ?? []
        })
      );

      const matchedCategory = this.categories.find(c => c.CategoryID === item.CategoryID);
      if (matchedCategory) {
        item.category = matchedCategory.name;
      }
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to save item";
    } finally {
      this.savingItemIds.delete(item.IngredientID);
      this.cdr.markForCheck();
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

  isSavingItem(itemId: number): boolean {
    return this.savingItemIds.has(itemId);
  }

  isAdjustingItem(itemId: number): boolean {
    return this.adjustingItemIds.has(itemId);
  }

  trackByItemId(_: number, item: FridgeItem) {
    return item.IngredientID;
  }
}