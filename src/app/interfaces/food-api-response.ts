export interface FoodApiResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}
export interface Recipe {
    id: number;
    title: string;
    image: string;
    imageType: string;
    readyInMinutes: number; 
    servings: number; 
    cuisines: string[]; 
    dishTypes: string[]; 
    diets: string[]; 
    glutenFree: boolean;
    dairyFree: boolean;
    vegetarian: boolean;
    vegan: boolean;
    ingredients: Ingredient[]; 
    nutrition?: Nutrition; 
    name: string;
    extendedIngredients?: { name: string; amount: number; unit: string }[];
    analyzedInstructions?: { steps?: { number: number; step: string; equipment?: Equipment[]; ingredients?: Ingredient[];
}[] }[];
  }
  
  export interface Ingredient {
    id: number;
    name: string;
    amount: number;
    unit: string; 
  }
  
  export interface Equipment {
    id: number;
    name: string;
    image: string; 
  }
  
  export interface Nutrition {
    protein: string; 
    carbs: string; 
    fat: string; 
    calories: string; 
    nutrients: Nutrient[]; 
  }
  
  export interface Nutrient {
    name: string; 
    amount: number; 
    unit: string; 
  }