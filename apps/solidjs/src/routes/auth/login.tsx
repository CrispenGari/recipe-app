import {
  Title,
  createCookieSessionStorage,
  parseCookie,
  useNavigate,
  useServerContext,
} from "solid-start";
import styles from "./login.module.css";
import { A, useRouteData } from "@solidjs/router";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { TOKEN_KEY } from "~/constants";
import { ErrorType, MeType } from "~/types";
import { Component, createEffect } from "solid-js";
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

const Login: Component<{}> = () => {
  const { latest } = useRouteData<typeof routeData>();
  const nav = useNavigate();
  createEffect(async () => {
    if (!!latest?.me) {
      nav("/", { replace: true });
    }
  });

  const storage = createCookieSessionStorage({
    cookie: {
      name: "session",
      secure: false,
      secrets: ["je"],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
    },
  });

  const [submitting, { Form }] = createServerAction$(
    async (form: FormData, { request, fetch }) => {
      const _data: { email: string; password: string } = {
        password: form.get("password") as string,
        email: form.get("email") as string,
      };

      const res = await fetch("http://127.0.0.1:3001/auth/login", {
        credentials: "include",
        body: JSON.stringify({
          ..._data,
        }),
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data: {
        user: MeType | null;
        error: ErrorType | null;
        jwt: string | null;
      } = await res.json();

      if (data.user && data.jwt) {
        throw redirect("/");
      }
      return { data };
    }
  );
  return (
    <main>
      <Title>Login</Title>
      <div class={styles.login}>
        <Form>
          <img alt="logo" src="/icon.png" />
          <h1>Login</h1>
          <input name="email" type="email" placeholder="email" />
          <input name="password" type="password" placeholder="password" />

          <div class={styles.error}>
            {submitting.result?.data.error?.field &&
              submitting.result.data.error.message}
          </div>
          <button type="submit">Login</button>
          <p>
            Already have an account? <span></span>
          </p>
          <A href="/auth/login">Login</A>
        </Form>
      </div>
    </main>
  );
};

export default Login;
