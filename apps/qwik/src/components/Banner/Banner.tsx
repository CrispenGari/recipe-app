import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Banner.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <div class="banner" style={{ backgroundImage: 'url("/cover.png")' }}>
      <h1>RECIPES APP</h1>
      <p>
        Welcome to our recipes app. Get to explore the recipes that we have in
        our database.
      </p>
    </div>
  );
});
