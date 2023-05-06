import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./Loading.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <div class="loading">
      <img alt="logo" src="/icon.png" />
      <h1>Loading...</h1>
    </div>
  );
});
