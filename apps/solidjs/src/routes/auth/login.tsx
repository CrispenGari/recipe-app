import { Title } from "solid-start";
import styles from "./login.module.css";
import { A } from "@solidjs/router";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { REDIRECT_CODES, TOKEN_KEY, storage } from "~/constants";
import { ErrorType, MeType } from "~/types";
import { Component, createSignal } from "solid-js";
export const routeData = () => {
  return createServerData$(async (_, event) => {
    const session = await storage.getSession(
      event.request.headers.get("Cookie") ?? ""
    );
    const token = session.get(TOKEN_KEY) ?? "";
    const res = await event.fetch("http://127.0.0.1:3001/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    const data = await res.json();
    const { me }: { me: MeType | null } = data;

    if (!!me) {
      return redirect("/", REDIRECT_CODES.TEMPORARY_REDIRECT);
    }
    return {
      me,
    };
  });
};

const Login: Component<{}> = () => {
  const [submitting, { Form }] = createServerAction$(
    async (form: FormData, { request, fetch }) => {
      const _data: { email: string; password: string } = {
        password: form.get("password") as string,
        email: form.get("email") as string,
      };
      const session = await storage.getSession(request.headers.get("Cookie"));
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
        session.set(TOKEN_KEY, data.jwt);
        return redirect("/", {
          headers: {
            "Set-Cookie": await storage.commitSession(session),
          },
        });
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
            {(submitting.result as any)?.data?.error &&
              (submitting.result as any)?.data?.error.message}
          </div>
          <button type="submit">Login</button>
          <p>
            Already have an account? <span></span>
          </p>
          <A href="/auth/register">Register</A>
        </Form>
      </div>
    </main>
  );
};

export default Login;
