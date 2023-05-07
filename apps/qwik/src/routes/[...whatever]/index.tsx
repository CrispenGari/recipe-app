import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./index.css?inline";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <div class="not__found">
      <div class="not__found__main">
        <h1>Page Not Found</h1>
        <img alt="logo" src="/icon.png" />
        <Link href="/">GO HOME</Link>
      </div>
    </div>
  );
});
