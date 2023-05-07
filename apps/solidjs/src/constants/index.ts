import { createCookieSessionStorage } from "solid-start";
export const TOKEN_KEY: string = "qid";
export const storage = createCookieSessionStorage({
  cookie: {
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export enum REDIRECT_CODES {
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  MOVED_PERMANENTLY = 301,
}
