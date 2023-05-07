import { Component } from "solid-js";
import styles from "./Banner.module.css";

const Banner: Component = () => {
  return (
    <div class={styles.banner}>
      <h1>RECIPES APP</h1>
      <p>
        Welcome to our recipes app. Get to explore the recipes that we have in
        our database.
      </p>
    </div>
  );
};
export default Banner;
