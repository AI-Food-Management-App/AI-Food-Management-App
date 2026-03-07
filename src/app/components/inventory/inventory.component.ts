import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { Category, FridgeService, FridgeItem } from "../../services/fridge.service";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit {
  // ---------- Inventory / Fridge ----------
  fridgeItems: FridgeItem[] = [];
  invLoading = false;

  invSearch = "";
  invCategory: string | null = null;

  // manual add
  invNewName = "";
  invNewQty: number | null = 1;

  categories: Category[] = [];
  invCategoryId: number | null = null;

  error: string | null = null;

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
      this.error = e?.message || "Failed to load categories";
    }
  }

  // ---------------- Inventory / Fridge ----------------
  async loadInventory() {
    this.invLoading = true;
    this.error = null;
    try {
      this.fridgeItems = await firstValueFrom(
      this.fridge.getItems(this.invCategoryId ?? undefined, this.invSearch || undefined)
    );
    } catch (e: any) {
      this.error = e?.message || "Failed to load inventory";
    } finally {
      this.invLoading = false;
    }
  }

  async addInventoryManual() {
  const name = this.invNewName.trim();
  if (!name) return;

  const qty = Number(this.invNewQty ?? 1);
  this.error = null;
  try {
    await firstValueFrom(this.fridge.adjustItem(name, Number.isFinite(qty) ? qty : 1));
    this.invNewName = "";
    this.invNewQty = 1;
    await this.loadInventory();
  } catch (e: any) {
    this.error = e?.message || "Failed to add inventory item";
  }
}

async adjustQty(item: FridgeItem, delta: number) {
  this.error = null;
  try {
    await firstValueFrom(this.fridge.adjustItem(item.name, delta));
    await this.loadInventory();
    } catch (e: any) {
      this.error = e?.message || "Failed to update quantity";
    }
  }
}
