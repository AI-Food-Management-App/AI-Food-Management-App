import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ShoppingListService,
  ShoppingItem,
  ShoppingList
} from "../../services/shopping-list.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-shopping-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./shopping-list.component.html"
})
export class ShoppingListComponent {
  lists: ShoppingList[] = [];
  listID: number | null = null;
  items: ShoppingItem[] = [];

  newName = "";
  newQty: number | null = null;

  creating = false;
  adding = false;
  loading = false;
  loadingLists = false;
  error: string | null = null;

  constructor(private shopping: ShoppingListService) {}

  async ngOnInit() {
    await this.loadLists();
  }

  async loadLists() {
    this.loadingLists = true;
    this.error = null;
    try {
      this.lists = await firstValueFrom(this.shopping.getLists());
    } catch (e: any) {
      this.error = e?.message || "Failed to load lists";
    } finally {
      this.loadingLists = false;
    }
  }

  async create() {
    this.creating = true;
    this.error = null;
    try {
      const resp = await firstValueFrom(this.shopping.createList());
      this.listID = resp.listID;
      await this.loadLists();
      await this.load();
    } catch (e: any) {
      this.error = e?.message || "Failed to create list";
    } finally {
      this.creating = false;
    }
  }

  async selectList(id: number) {
    this.listID = id;
    await this.load();
  }

  async load() {
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

  async add() {
    if (!this.listID) return;
    this.adding = true;
    this.error = null;
    try {
      await firstValueFrom(
        this.shopping.addItem(this.listID, this.newName, this.newQty)
      );
      this.newName = "";
      this.newQty = null;
      await this.load();
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
      await firstValueFrom(
        this.shopping.toggleItem(this.listID, item.itemID, checked)
      );
      await this.load();
    } catch (e: any) {
      this.error = e?.message || "Failed to toggle item";
    }
  }

  async del(item: ShoppingItem) {
    if (!this.listID) return;
    this.error = null;
    try {
      await firstValueFrom(
        this.shopping.deleteItem(this.listID, item.itemID)
      );
      await this.load();
    } catch (e: any) {
      this.error = e?.message || "Failed to delete item";
    }
  }
}
