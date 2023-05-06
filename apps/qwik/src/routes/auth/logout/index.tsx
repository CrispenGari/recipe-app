import { component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { REDIRECT_CODES, TOKEN_KEY, cookiesOptions } from "~/constants";
import Loading from "~/components/Loading/Loading";

export const onGet: RequestHandler = async (response) => {
  const res = await fetch("http://127.0.0.1:3001/auth/logout", {
    credentials: "include",
    method: "POST",
  });
  if (res.statusText === "OK") {
    await response.cookie.delete(TOKEN_KEY, cookiesOptions);
    response.redirect(REDIRECT_CODES.PERMANENT_REDIRECT, "/auth/login");
  } else {
    response.redirect(REDIRECT_CODES.PERMANENT_REDIRECT, "/");
  }
};

export default component$(() => {
  return <Loading />;
});

export const head: DocumentHead = {
  title: "Logout",
  meta: [
    {
      name: "logout",
      content: "loging out of the app.",
    },
  ],
};
