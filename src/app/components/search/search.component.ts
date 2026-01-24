import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FoodApiService } from '../../services/api.service';
import { Recipe } from '../../interfaces/food-api-response';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnChanges {
  recipes: Recipe[] = [];
  ingredients: string = '';
  diet: string = '';
  ingredientList: string[] = []; 
  @Output() searchEvent = new EventEmitter<Recipe[]>(); 
  @Input() autoFillIngredients: string[] = []; // Receive ingredients from parent component

  constructor(private foodApiService: FoodApiService) {}

  searchRecipes(): void {
    this.ingredientList = this.ingredients.split(',').map(ingredient => ingredient.trim()); // Parse ingredients
    this.foodApiService.getRecipes(this.ingredientList, undefined, [], this.diet).subscribe({
      next: (response) => {
        this.searchEvent.emit(response.results); // Emit recipes to the parent component
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  ngOnChanges() {
    if (this.autoFillIngredients.length > 0) {
       this.ingredients = this.autoFillIngredients.join(', ');
      this.searchRecipes();
    }
 }


  
}