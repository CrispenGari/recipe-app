import { Component } from "solid-js";
import { IngredientType } from "~/types";
import styles from "./Igredient.module.css";
interface Props {
  ingridient: IngredientType;
}
const Igredient: Component<Props> = ({
  ingridient: { name, type, quantity },
}) => {
  return (
    <div class={styles.ingredient}>
      <h4>
        {name} ({quantity})
      </h4>
      <p>{type}</p>
    </div>
  );
};

export default Igredient;
