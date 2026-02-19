import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ShoppingListService, ShoppingItem } from "../../services/shopping-list.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-shopping-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./shopping-list.component.html"
})
export class ShoppingListComponent {
  userID = 1;

  listID: number | null = null;
  items: ShoppingItem[] = [];

  newName = "";
  newQty: number | null = null;

  creating = false;
  adding = false;
  loading = false;
  error: string | null = null;

  constructor(private shopping: ShoppingListService) {}

async create() {
  this.creating = true;
  this.error = null;
  try {
    const resp = await firstValueFrom(this.shopping.createList());
    this.listID = resp.listID;
    await this.load();
  } catch (e: any) {
    this.error = e?.message || "Failed to create list";
  } finally {
    this.creating = false;
  }
}


  async load() {
    if (!this.listID) return;
    this.loading = true;
    this.items = await firstValueFrom(this.shopping.getList(this.listID));
    this.loading = false;
  }

  async add() {
    if (!this.listID) return;
    this.adding = true;
    await firstValueFrom(
      this.shopping.addItem(this.listID, this.newName, this.newQty)
    );
    this.newName = "";
    this.newQty = null;
    await this.load();
    this.adding = false;
  }

  async toggle(item: ShoppingItem, event: Event) {
    if (!this.listID) return;
    const checked = (event.target as HTMLInputElement).checked;
    await firstValueFrom(
      this.shopping.toggleItem(this.listID, item.itemID, checked)
    );
    await this.load();
  }

  async del(item: ShoppingItem) {
    if (!this.listID) return;
    await firstValueFrom(
      this.shopping.deleteItem(this.listID, item.itemID)
    );
    await this.load();
  }
}
