import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Form, Link, routeAction$ } from "@builder.io/qwik-city";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import type { ErrorType, MeType } from "~/types";
import styles from "./login.css?inline";

import { REDIRECT_CODES, TOKEN_KEY, cookiesOptions } from "~/constants";

export const onGet: RequestHandler = async (response) => {
  const token = response.cookie.get(TOKEN_KEY);
  const res = await fetch("http://127.0.0.1:3001/auth/me", {
    headers: {
      Authorization: `Bearer ${token?.value ? token.value : ""}`,
    },
    credentials: "include",
  });

  const { me }: { me: MeType | null } = await res.json();

  if (me) {
    response.redirect(REDIRECT_CODES.TEMPORARY_REDIRECT, "/");
  }
};

export const useLogin = routeAction$(async (data, response) => {
  const res = await fetch("http://127.0.0.1:3001/auth/login", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
    method: "POST",
  });
  const _data: {
    user: MeType | null;
    error: ErrorType | null;
    jwt: string | null;
  } = await res.json();
  if (_data.user && _data.jwt) {
    response.cookie.set(TOKEN_KEY, _data.jwt, cookiesOptions);
    response.redirect(REDIRECT_CODES.TEMPORARY_REDIRECT, "/");
  }
  return {
    success: true,
    error: _data.error,
  };
});

export default component$(() => {
  useStylesScoped$(styles);
  const action = useLogin();

  return (
    <div class="login">
      <Form action={action}>
        <img alt="logo" src="/icon.png" />
        <h1>Login</h1>
        <input name="email" type="email" placeholder="email" />
        <input name="password" type="password" placeholder="password" />
        <div class="error">
          {action.value?.error && action.value.error.message}
        </div>
        <button type="submit">Login</button>
        <p>
          New to this app? <span></span>
        </p>
        <Link href="/auth/register">Register</Link>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login",
  meta: [
    {
      name: "Login",
      content: "Log in to our app.",
    },
  ],
};
