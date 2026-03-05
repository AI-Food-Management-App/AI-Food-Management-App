import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { Category } from "../../services/fridge.service";

import {
  ShoppingListService,
  ShoppingItem,
  ShoppingList
} from "../../services/shopping-list.service";

import { FridgeService, FridgeItem } from "../../services/fridge.service";

@Component({
  selector: "app-shopping-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./shopping-list.component.html",
  styleUrl: "./shopping-list.component.css",
})
export class ShoppingListComponent implements OnInit {
  // ---------- Shopping Lists ----------
  lists: ShoppingList[] = [];
  listID: number | null = null;
  items: ShoppingItem[] = [];

  newName = "";
  newQty: number | null = null;

  creating = false;
  adding = false;
  loading = false;
  loadingLists = false;

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

  constructor(private shopping: ShoppingListService, private fridge: FridgeService) {}

  async ngOnInit() {
    await Promise.all([this.loadLists(), this.loadCategories()]);
    await this.loadInventory();
  }

  // ---------------- Shopping Lists ----------------
  async loadLists() {
    this.loadingLists = true;
    this.error = null;
    try {
      this.lists = await firstValueFrom(this.shopping.getLists());

      // auto-select newest list if none selected
      if (!this.listID && this.lists.length) {
        this.listID = this.lists[0].listID;
        await this.loadListItems();
      }
    } catch (e: any) {
      this.error = e?.message || "Failed to load lists";
    } finally {
      this.loadingLists = false;
    }
  }
  async loadCategories() {
  this.error = null;
  try {
      this.categories = await firstValueFrom(this.fridge.getCategories());
    } catch (e: any) {
      this.error = e?.message || "Failed to load categories";
    }
  }

  async create() {
    this.creating = true;
    this.error = null;
    try {
      const resp = await firstValueFrom(this.shopping.createList());
      this.listID = resp.listID;
      await this.loadLists();
      await this.loadListItems();
    } catch (e: any) {
      this.error = e?.message || "Failed to create list";
    } finally {
      this.creating = false;
    }
  }

  async selectList(id: number) {
    this.listID = id;
    await this.loadListItems();
  }

  async loadListItems() {
    if (!this.listID) return;
    this.loading = true;
    this.error = null;
    try {
      this.items = await firstValueFrom(this.shopping.getList(this.listID));
    } catch (e: any) {
      this.error = e?.message || "Failed to load items";
    } finally {
      this.loading = false;
    }
  }

  async addToShoppingList() {
    if (!this.listID) return;
    this.adding = true;
    this.error = null;
    try {
      await firstValueFrom(this.shopping.addItem(this.listID, this.newName, this.newQty));
      this.newName = "";
      this.newQty = null;
      await this.loadListItems();
    } catch (e: any) {
      this.error = e?.message || "Failed to add item";
    } finally {
      this.adding = false;
    }
  }

  async toggle(item: ShoppingItem, event: Event) {
    if (!this.listID) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.error = null;
    try {
      await firstValueFrom(this.shopping.toggleItem(this.listID, item.itemID, checked));
      // no refresh button, so reload after change
      await this.loadListItems();
    } catch (e: any) {
      this.error = e?.message || "Failed to toggle item";
    }
  }

  async del(item: ShoppingItem) {
    if (!this.listID) return;
    this.error = null;
    try {
      await firstValueFrom(this.shopping.deleteItem(this.listID, item.itemID));
      await this.loadListItems();
    } catch (e: any) {
      this.error = e?.message || "Failed to delete item";
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