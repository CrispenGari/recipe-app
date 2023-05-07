import { Component } from "solid-js";
import styles from "./Recipe.module.css";
import { RecipesType } from "~/types";
import { A } from "solid-start";
interface Props {
  recipe: RecipesType;
}
const Recipe: Component<Props> = ({ recipe }) => {
  return (
    <div class={styles.recipe}>
      <h1>{recipe.name}</h1>
      <img src={recipe.imageURL || "/cover.jpg"} alt={recipe.name} />
      <A href={`/recipe/${recipe.name}`}>OPEN</A>
    </div>
  );
};

export default Recipe;
