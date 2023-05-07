import { Component } from "solid-js";
import styles from "./Header.module.css";
import { useNavigate } from "@solidjs/router";

const Header: Component = () => {
  const nav = useNavigate();
  return (
    <div class={styles.header}>
      <img
        alt="logo"
        src="/icon.png"
        onClick={() => nav("/", { replace: true })}
      />
      <button
        onClick={() => {
          nav("/auth/logout", { replace: true });
        }}
      >
        LOGOUT
      </button>
    </div>
  );
};

export default Header;
