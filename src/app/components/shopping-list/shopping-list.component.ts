import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import {
  ShoppingListService,
  ShoppingItem,
  ShoppingList
} from "../../services/shopping-list.service";

@Component({
  selector: "app-shopping-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./shopping-list.component.html",
  styleUrl: "./shopping-list.component.css",
})
export class ShoppingListComponent implements OnInit {
  openList: ShoppingList | null = null;
  historyLists: ShoppingList[] = [];
  items: ShoppingItem[] = [];

  newListName = "";
  newName = "";
  newQty: number | null = null;

  creating = false;
  adding = false;
  loading = false;
  loadingHistory = false;
  confirming = false;
  closing = false;

  error: string | null = null;
  success: string | null = null;

  expandedHistoryListId: number | null = null;
  historyItemsMap: Record<number, ShoppingItem[]> = {};
  historyLoadingMap: Record<number, boolean> = {};

  constructor(private shopping: ShoppingListService) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    await Promise.all([
      this.loadOpenList(),
      this.loadHistory()
    ]);
  }

  async loadOpenList() {
    this.loading = true;
    this.error = null;

    try {
      this.openList = await firstValueFrom(this.shopping.getOpenList());

      if (this.openList?.listID) {
        this.items = await firstValueFrom(this.shopping.getList(this.openList.listID));
      } else {
        this.items = [];
      }
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load shopping list";
    } finally {
      this.loading = false;
    }
  }

  async loadHistory() {
    this.loadingHistory = true;
    try {
      this.historyLists = await firstValueFrom(this.shopping.getHistory());
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load history";
    } finally {
      this.loadingHistory = false;
    }
  }

  async create() {
    const name = this.newListName.trim();
    if (!name) return;

    this.creating = true;
    this.error = null;
    this.success = null;

    try {
      this.openList = await firstValueFrom(this.shopping.createList(name));
      this.newListName = "";
      this.items = [];
      await this.loadOpenList();
      await this.loadHistory();
      this.success = "Shopping list created";
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to create list";
    } finally {
      this.creating = false;
    }
  }

async addToShoppingList() {
  if (!this.openList?.listID) return;

  const name = this.newName.trim();
  if (!name) {
    this.error = "Item name is required";
    return;
  }

  let qty = Number(this.newQty ?? 1);
  if (!Number.isFinite(qty)) qty = 1;
  qty = Math.floor(qty);

  if (qty < 1) {
    this.error = "Quantity must be at least 1";
    return;
  }

  this.adding = true;
  this.error = null;
  this.success = null;

  try {
    await firstValueFrom(this.shopping.addItem(this.openList.listID, name, qty));
    this.newName = "";
    this.newQty = 1;
    await this.loadOpenList();
  } catch (e: any) {
    this.error = e?.error?.error || e?.message || "Failed to add item";
  } finally {
    this.adding = false;
  }
}

  async toggle(item: ShoppingItem, event: Event) {
    if (!this.openList?.listID) return;

    const checked = (event.target as HTMLInputElement).checked;
    this.error = null;

    try {
      await firstValueFrom(this.shopping.toggleItem(this.openList.listID, item.itemID, checked));
      await this.loadOpenList();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to update item";
    }
  }

  async del(item: ShoppingItem) {
    if (!this.openList?.listID) return;

    this.error = null;
    this.success = null;

    try {
      await firstValueFrom(this.shopping.deleteItem(this.openList.listID, item.itemID));
      await this.loadOpenList();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to delete item";
    }
  }

  async confirmChecked() {
    if (!this.openList?.listID) return;

    this.confirming = true;
    this.error = null;
    this.success = null;

    try {
      const resp = await firstValueFrom(this.shopping.confirmChecked(this.openList.listID));
      this.items = this.items.filter(i => !i.checked);
      this.success = resp.moved > 0
        ? `${resp.moved} checked item(s) moved to inventory`
        : (resp.message || "No checked items to confirm");
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to confirm checked items";
    } finally {
      this.confirming = false;
    }
  }

  async closeList() {
    if (!this.openList?.listID) return;

    this.closing = true;
    this.error = null;
    this.success = null;

    try {
      await firstValueFrom(this.shopping.closeList(this.openList.listID));
      this.success = "Shopping list closed";
      await this.loadAll();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to close list";
    } finally {
      this.closing = false;
    }
  }

  async toggleHistoryList(list: ShoppingList) {
    const listID = list.listID;

    if (this.expandedHistoryListId === listID) {
      this.expandedHistoryListId = null;
      return;
    }

    this.expandedHistoryListId = listID;

    if (this.historyItemsMap[listID]) return;

    this.historyLoadingMap[listID] = true;
    this.error = null;

    try {
      this.historyItemsMap[listID] = await firstValueFrom(
        this.shopping.getHistoryListItems(listID)
      );
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load history items";
    } finally {
      this.historyLoadingMap[listID] = false;
    }
  }

  get checkedCount(): number {
    return this.items.filter(i => i.checked).length;
  }

  formatDate(date?: string | null): string {
    if (!date) return "";
    return new Date(date).toLocaleString();
  }

  getHistoryItems(listID: number): ShoppingItem[] {
    return this.historyItemsMap[listID] ?? [];
  }

  isHistoryOpen(listID: number): boolean {
    return this.expandedHistoryListId === listID;
  }

  isHistoryLoading(listID: number): boolean {
    return !!this.historyLoadingMap[listID];
  }

  trackByItemId(_: number, item: ShoppingItem) {
    return item.itemID;
  }

  trackByListId(_: number, list: ShoppingList) {
    return list.listID;
  }
}