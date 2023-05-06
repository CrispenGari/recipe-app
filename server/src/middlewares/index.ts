import { Middleware } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { verifyJwt } from "../utils/index.ts";
import { client } from "../mysql/index.ts";

export const isAuthenticated: Middleware = async (ctx, next) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  try {
    const auth = await ctx.request.headers.get("authorization");
    const jwt = auth ? auth.split(/\s/)[1] : "";

    if (!jwt) {
      return (ctx.response.body = {
        code: 401,
        message: "You are not authenticated.",
      });
    }
    const payload = await verifyJwt(jwt);
    const res = await client.execute(
      "SELECT id, email, created_at, updated_at FROM user WHERE id=?;",
      [payload.id]
    );
    const me: {
      id: number;
      email: string;
      created_at: Date;
      updated_at: Date;
    } | null = res.rows ? res.rows[0] : null;
    if (!me) {
      return (ctx.response.body = {
        code: 401,
        message: "You are not authenticated.",
      });
    }

    return next();
  } catch (error) {
    return (ctx.response.body = {
      message: error.message,
      code: 500,
    });
  }
};
