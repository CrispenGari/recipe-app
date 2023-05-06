import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Igredient.css?inline";
import type { IngredientType } from "~/types";

export default component$(({ name, quantity, type }: IngredientType) => {
  useStylesScoped$(styles);
  return (
    <div class="ingredient">
      <h4>
        {name} ({quantity})
      </h4>
      <p>{type}</p>
    </div>
  );
});
