import { RouteDataArgs, Title, parseCookie, redirect } from "solid-start";
import styles from "./register.module.css";
import { A, useNavigate, useRouteData } from "@solidjs/router";
import { createServerData$ } from "solid-start/server";
import { TOKEN_KEY, REDIRECT_CODES } from "~/constants";
import { MeType } from "~/types";
import { createEffect } from "solid-js";

export const routeData = () => {
  return createServerData$(async (_, event) => {
    const cookies = parseCookie(event.request.headers.get("Cookie") ?? "");
    const token = cookies[TOKEN_KEY] ?? "";

    const res = await event.fetch("http://127.0.0.1:3001/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    const { me }: { me: MeType | null } = await res.json();
    return {
      me,
    };
  });
};

const Register = ({}) => {
  const { latest } = useRouteData<typeof routeData>();
  const nav = useNavigate();
  createEffect(async () => {
    if (!!latest?.me) {
      nav("/", { replace: true });
    }
  });

  return (
    <main>
      <Title>Register</Title>
      <div class={styles.register}>
        <form>
          <img alt="logo" src="/icon.png" />
          <h1>Register</h1>
          <input name="email" type="email" placeholder="email" />
          <input name="password" type="password" placeholder="password" />
          <div class={styles.error}>erro</div>
          <button type="submit">Register</button>
          <p>
            Already have an account? <span></span>
          </p>
          <A href="/auth/login">Login</A>
        </form>
      </div>
    </main>
  );
};

export default Register;
