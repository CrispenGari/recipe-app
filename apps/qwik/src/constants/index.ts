import type { CookieOptions } from "@builder.io/qwik-city";

export const TOKEN_KEY: string = "qid";

export const cookiesOptions = {
  sameSite: "lax",
  httpOnly: true,
  path: "/",
  secure: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
} as CookieOptions;

export enum REDIRECT_CODES {
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  MOVED_PERMANENTLY = 301,
}
