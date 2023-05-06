export interface MeType {
  email: string;
  id: number;
  created_at: string;
  updated_at: string;
}
export interface ErrorType {
  message: string;
  field: string;
}

export type IngredientType = {
  quantity: string;
  name: string;
  type: string;
};
export interface RecipesType {
  name: string;
  ingredients: IngredientType[];
  steps: string[];
  timers: number[];
  imageURL: string;
  originalURL: string;
}
