import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Header.css?inline";
import { useNavigate } from "@builder.io/qwik-city";
export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  return (
    <div class="header">
      <img alt="logo" src="/icon.png" onClick$={() => nav("/", true)} />
      <button
        onClick$={() => {
          nav("/auth/logout");
        }}
      >
        LOGOUT
      </button>
    </div>
  );
});
