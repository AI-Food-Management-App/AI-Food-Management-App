import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FoodApiService } from "../../services/api.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./search.component.html"
})
export class SearchComponent {
  query = "";
  loading = false;
  error: string | null = null;

  constructor(private foodApi: FoodApiService) {}

  async search() {
    this.loading = true;
    this.error = null;

  }
}
