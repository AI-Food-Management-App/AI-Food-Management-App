import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingListComponent implements OnInit {
  openList: ShoppingList | null = null;
  historyLists: ShoppingList[] = [];
  items: ShoppingItem[] = [];

  newListName = "";
  newName = "";
  newQty: number | null = 1;

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

  togglingItemIds = new Set<number>();
  deletingItemIds = new Set<number>();

  constructor(
    private shopping: ShoppingListService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.cdr.markForCheck();

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
      this.cdr.markForCheck();
    }
  }

  async loadHistory() {
    this.loadingHistory = true;
    this.cdr.markForCheck();

    try {
      this.historyLists = await firstValueFrom(this.shopping.getHistory());
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load history";
    } finally {
      this.loadingHistory = false;
      this.cdr.markForCheck();
    }
  }

  async create() {
    const name = this.newListName.trim();
    if (!name) {
      this.error = "List name is required";
      this.cdr.markForCheck();
      return;
    }

    this.creating = true;
    this.error = null;
    this.success = null;
    this.cdr.markForCheck();

    try {
      const created = await firstValueFrom(this.shopping.createList(name));
      this.openList = created;
      this.newListName = "";
      this.items = [];
      this.success = "Shopping list created";

      await this.loadOpenList();
      await this.loadHistory();
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to create list";
    } finally {
      this.creating = false;
      this.cdr.markForCheck();
    }
  }

  async addToShoppingList() {
    if (!this.openList?.listID) return;

    const name = this.newName.trim();
    if (!name) {
      this.error = "Item name is required";
      this.cdr.markForCheck();
      return;
    }

    let qty = Number(this.newQty ?? 1);
    if (!Number.isFinite(qty)) qty = 1;
    qty = Math.floor(qty);

    if (qty < 1) {
      this.error = "Quantity must be at least 1";
      this.cdr.markForCheck();
      return;
    }

    this.adding = true;
    this.error = null;
    this.success = null;
    this.cdr.markForCheck();

    try {
      const created: any = await firstValueFrom(
        this.shopping.addItem(this.openList.listID, name, qty)
      );

      const existingIndex = this.items.findIndex(
        i => i.ingredientID === created?.ingredientID || i.name.toLowerCase() === name.toLowerCase()
      );

      if (existingIndex >= 0) {
        this.items = this.items.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: qty,
                checked: false
              }
            : item
        );
      } else {
        this.items = [
          {
            itemID: created?.itemID ?? Date.now(),
            ingredientID: created?.ingredientID ?? -Date.now(),
            name,
            quantity: qty,
            checked: false
          },
          ...this.items
        ];
      }

      this.newName = "";
      this.newQty = 1;
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to add item";
    } finally {
      this.adding = false;
      this.cdr.markForCheck();
    }
  }

  async toggle(item: ShoppingItem, event: Event) {
    if (!this.openList?.listID) return;
    if (this.togglingItemIds.has(item.itemID)) return;

    const checked = (event.target as HTMLInputElement).checked;
    const previous = item.checked;

    this.togglingItemIds.add(item.itemID);
    item.checked = checked;
    this.error = null;
    this.cdr.markForCheck();

    try {
      await firstValueFrom(
        this.shopping.toggleItem(this.openList.listID, item.itemID, checked)
      );
    } catch (e: any) {
      item.checked = previous;
      this.error = e?.error?.error || e?.message || "Failed to update item";
    } finally {
      this.togglingItemIds.delete(item.itemID);
      this.cdr.markForCheck();
    }
  }

  async del(item: ShoppingItem) {
    if (!this.openList?.listID) return;
    if (this.deletingItemIds.has(item.itemID)) return;

    const previousItems = [...this.items];

    this.deletingItemIds.add(item.itemID);
    this.items = this.items.filter(i => i.itemID !== item.itemID);
    this.error = null;
    this.success = null;
    this.cdr.markForCheck();

    try {
      await firstValueFrom(this.shopping.deleteItem(this.openList.listID, item.itemID));
    } catch (e: any) {
      this.items = previousItems;
      this.error = e?.error?.error || e?.message || "Failed to delete item";
    } finally {
      this.deletingItemIds.delete(item.itemID);
      this.cdr.markForCheck();
    }
  }

  async confirmChecked() {
    if (!this.openList?.listID) return;

    this.confirming = true;
    this.error = null;
    this.success = null;
    this.cdr.markForCheck();

    const previousItems = [...this.items];

    try {
      const resp = await firstValueFrom(this.shopping.confirmChecked(this.openList.listID));
      this.items = this.items.filter(i => !i.checked);
      this.success = resp.moved > 0
        ? `${resp.moved} checked item(s) moved to inventory`
        : (resp.message || "No checked items to confirm");
    } catch (e: any) {
      this.items = previousItems;
      this.error = e?.error?.error || e?.message || "Failed to confirm checked items";
    } finally {
      this.confirming = false;
      this.cdr.markForCheck();
    }
  }

  async closeList() {
    if (!this.openList?.listID) return;

    this.closing = true;
    this.error = null;
    this.success = null;
    this.cdr.markForCheck();

    const previousOpenList = this.openList;
    const previousItems = [...this.items];

    try {
      const resp = await firstValueFrom(this.shopping.closeList(this.openList.listID));

      if (resp?.list) {
        this.historyLists = [resp.list, ...this.historyLists];
      }

      this.openList = null;
      this.items = [];
      this.success = "Shopping list closed";
    } catch (e: any) {
      this.openList = previousOpenList;
      this.items = previousItems;
      this.error = e?.error?.error || e?.message || "Failed to close list";
    } finally {
      this.closing = false;
      this.cdr.markForCheck();
    }
  }

  async toggleHistoryList(list: ShoppingList) {
    const listID = list.listID;

    if (this.expandedHistoryListId === listID) {
      this.expandedHistoryListId = null;
      this.cdr.markForCheck();
      return;
    }

    this.expandedHistoryListId = listID;
    this.cdr.markForCheck();

    if (this.historyItemsMap[listID]) return;

    this.historyLoadingMap[listID] = true;
    this.error = null;
    this.cdr.markForCheck();

    try {
      this.historyItemsMap[listID] = await firstValueFrom(
        this.shopping.getHistoryListItems(listID)
      );
    } catch (e: any) {
      this.error = e?.error?.error || e?.message || "Failed to load history items";
    } finally {
      this.historyLoadingMap[listID] = false;
      this.cdr.markForCheck();
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

  isItemBusy(itemID: number): boolean {
    return this.togglingItemIds.has(itemID) || this.deletingItemIds.has(itemID);
  }

  trackByItemId(_: number, item: ShoppingItem) {
    return item.itemID;
  }

  trackByListId(_: number, list: ShoppingList) {
    return list.listID;
  }
}