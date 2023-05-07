import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import styles from "./404.module.css";
import { A } from "@solidjs/router";
export default function NotFound() {
  return (
    <div class={styles.not__found}>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />

      <div class={styles.not__found__main}>
        <h1>Page Not Found</h1>
        <img alt="logo" src="/icon.png" />
        <A href="/">GO HOME</A>
      </div>
    </div>
  );
}
