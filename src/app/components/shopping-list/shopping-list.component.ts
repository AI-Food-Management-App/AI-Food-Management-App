import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ShoppingListService, ShoppingItem } from "../../services/shopping-list.service";

@Component({
  selector: "app-shopping-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./shopping-list.component.html",
  styleUrls: ["./shopping-list.component.css"],
})
export class ShoppingListComponent implements OnInit {
  userID = 1;               // until auth exists
  listID: number | null = null;

  items: ShoppingItem[] = [];
  newName = "";
  newQuantity: number | null = null;

  loading = false;
  error = "";

  constructor(private shopping: ShoppingListService) {}

  async ngOnInit() {
    // Create a list automatically the first time (simple approach)
    this.loading = true;
    this.error = "";

    this.shopping.createList(this.userID).subscribe({
      next: ({ listID }) => {
        this.listID = listID;
        this.refresh();
      },
      error: (err) => {
        this.loading = false;
        this.error = "Failed to create shopping list.";
        console.error(err);
      },
    });
  }

  refresh() {
    if (!this.listID) return;
    this.shopping.getList(this.listID).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = "Failed to load shopping list.";
        console.error(err);
      },
    });
  }

  add() {
    if (!this.listID) return;
    const name = this.newName.trim();
    if (!name) return;

    this.shopping.addItem(this.listID, this.userID, name, this.newQuantity).subscribe({
      next: () => {
        this.newName = "";
        this.newQuantity = null;
        this.refresh();
      },
      error: (err) => {
        this.error = "Failed to add item.";
        console.error(err);
      },
    });
  }

  toggle(item: ShoppingItem) {
    if (!this.listID) return;
    this.shopping.toggleItem(this.listID, item.itemID, !item.checked).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        this.error = "Failed to update item.";
        console.error(err);
      },
    });
  }

  remove(item: ShoppingItem) {
    if (!this.listID) return;
    this.shopping.deleteItem(this.listID, item.itemID).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        this.error = "Failed to delete item.";
        console.error(err);
      },
    });
  }
}
