
export enum Category {
  REFRIGERATED = '冷藏',
  FROZEN = '冷冻',
  ROOM_TEMP = '常温',
  STAPLE = '主食',
  CONDIMENT = '调料'
}

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
}

export interface Recipe {
  name: string;
  description: string;
  difficulty: string;
  cookingTime: string;
  mainIngredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  failurePoints: string[];
}

export interface SavedRecipe extends Recipe {
  id: string;
  savedAt: number;
  userNotes?: string;
  folder?: string;
}

export interface UserPreferences {
  cuisine: string;
  taste: string;
  additionalNotes?: string;
  mustUseIngredientIds?: string[];
}

export interface AppSettings {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export interface ModelOption {
  name: string;
  displayName?: string;
}
