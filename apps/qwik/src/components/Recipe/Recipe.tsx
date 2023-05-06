import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./Recipe.css?inline";
import type { RecipesType } from "~/types";
import { Link } from "@builder.io/qwik-city";
import { encodeId } from "~/utils";

interface Props {
  recipe: RecipesType;
}
export default component$((props: Props) => {
  useStylesScoped$(styles);
  return (
    <div class="recipe">
      <h1>{props.recipe.name}</h1>
      <img
        src={props.recipe.imageURL || "/cover.jpg"}
        alt={props.recipe.name}
      />
      <Link href={`/recipe/${encodeId(props.recipe.name)}`}>OPEN</Link>
    </div>
  );
});
