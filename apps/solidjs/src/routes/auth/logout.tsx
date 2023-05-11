import { Title } from "solid-start";
import styles from "./login.module.css";
import { A } from "@solidjs/router";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { REDIRECT_CODES, storage } from "~/constants";

import { Component } from "solid-js";
export const routeData = () => {
  return createServerData$(async (_, event) => {
    const session = await storage.getSession(
      event.request.headers.get("Cookie") ?? ""
    );

    const res = await event.fetch("http://127.0.0.1:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (res.statusText === "OK") {
      return redirect("/auth/login", {
        headers: {
          "Set-Cookie": await storage.destroySession(session),
        },
      });
    } else {
      return redirect("/", REDIRECT_CODES.TEMPORARY_REDIRECT);
    }
  });
};

const Logout: Component<{}> = () => {
  return <p>logout...</p>;
};

export default Logout;
