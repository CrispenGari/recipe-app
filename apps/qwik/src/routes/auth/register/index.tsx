import { component$, useStylesScoped$ } from "@builder.io/qwik";

import { routeAction$, Form, Link } from "@builder.io/qwik-city";
import type { RequestHandler, DocumentHead } from "@builder.io/qwik-city";

import { REDIRECT_CODES, TOKEN_KEY, cookiesOptions } from "~/constants";
import type { ErrorType, MeType } from "~/types";
import styles from "./register.css?inline";

export const onGet: RequestHandler = async (response) => {
  const token = response.cookie.get(TOKEN_KEY);
  const res = await fetch("http://127.0.0.1:3001/auth/me", {
    headers: {
      Authorization: `Bearer ${token?.value ? token.value : ""}`,
    },
    credentials: "include",
    method: "POST",
  });

  const { me }: { me: MeType | null } = await res.json();

  if (me) {
    response.redirect(REDIRECT_CODES.TEMPORARY_REDIRECT, "/");
  }
};

export const useRegister = routeAction$(async (data, response) => {
  const res = await fetch("http://127.0.0.1:3001/auth/login", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
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
  const action = useRegister();
  return (
    <div class="register">
      <Form action={action}>
        <img alt="logo" src="/icon.png" />
        <h1>Register</h1>
        <input name="email" type="email" placeholder="email" />
        <input name="password" type="password" placeholder="password" />
        <div class="error">
          {action.value?.error && action.value.error.message}
        </div>
        <button type="submit">Register</button>
        <p>
          Already have an account? <span></span>
        </p>
        <Link href="/auth/login">Login</Link>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Register",
  meta: [
    {
      name: "Register",
      content: "Register  to our app.",
    },
  ],
};
