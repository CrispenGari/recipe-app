// @module: esnext
// ---cut---
import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { TOKEN_KEY } from "~/constants";

const storage = createCookieSessionStorage({
  cookie: {
    name: "my-sesssion",
    secure: false,
    secrets: ["hello"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});
export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}
export async function getToken(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get(TOKEN_KEY);
  if (!userId || typeof userId !== "string") return null;
  return userId;
}
// export async function requireUserId(
//   request: Request,
//   redirectTo: string = new URL(request.url).pathname
// ) {
//   const session = await getUserSession(request);
//   const userId = session.get("userId");
//   if (!userId || typeof userId !== "string") {
//     const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
//     throw redirect(`/login?${searchParams}`);
//   }
//   return userId;
// }
// export async function getUser(request: Request) {
//   const userId = await getUserId(request);
//   if (typeof userId !== "string") {
//     return null;
//   }
//   try {
//     const user = await db.user.findUnique({ where: { id: Number(userId) } });
//     return user;
//   } catch {
//     throw logout(request);
//   }
// }
// export async function logout(request: Request) {
//   const session = await storage.getSession(request.headers.get("Cookie"));
//   return redirect("/login", {
//     headers: {
//       "Set-Cookie": await storage.destroySession(session),
//     },
//   });
// }
export async function createUserSession(token: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set(TOKEN_KEY, token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
