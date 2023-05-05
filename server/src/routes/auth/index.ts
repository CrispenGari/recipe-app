import { Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";
import { client } from "../../mysql/index.ts";
import { signJwt } from "../../utils/index.ts";
import { __cookieName__ } from "../../constants/index.ts";
const authRouter = new Router();

authRouter.get("/user", (ctx) => {
  return (ctx.response.body = `getting user`);
});
authRouter.post("/login", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  const value = ctx.request.body();
  if (value.type === "json") {
    try {
      const { email, password } = (await value.value) as {
        email: string;
        password: string;
      };

      const found = await client.execute(
        "SELECT id, password FROM user WHERE email=?;",
        [email.trim().toLocaleLowerCase()]
      );
      const exists: { id: string; password: string } | null = found.rows
        ? found.rows[0]
        : null;

      if (!exists) {
        return (ctx.response.body = {
          user: null,
          error: {
            message: "invalid email address.",
            field: "email",
          },
        });
      }
      const correct = await bcrypt.compare(password, exists.password);
      if (!correct) {
        return (ctx.response.body = {
          user: null,
          error: {
            message: "invalid account password.",
            field: "password",
          },
        });
      }

      const res = await client.execute(
        "SELECT id, email, created_at, updated_at FROM user WHERE id=?;",
        [exists.id]
      );
      const me: {
        id: number;
        email: string;
        created_at: Date;
        updated_at: Date;
      } | null = res.rows ? res.rows[0] : null;

      if (!me) {
        throw new Error("There's no me!");
      }
      const jwt = await signJwt(me);
      await ctx.cookies.set(__cookieName__, jwt, {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
      });
      return (ctx.response.body = {
        error: null,
        user: me,
      });
    } catch (error) {
      return (ctx.response.body = {
        message: error.message,
        code: 500,
      });
    }
  } else {
    return (ctx.response.body = {
      message: "the request body must be in json format.",
      code: 500,
    });
  }
});
authRouter.post("/register", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  const value = ctx.request.body();
  if (value.type === "json") {
    try {
      const { email, password } = (await value.value) as {
        email: string;
        password: string;
      };

      if (!email.includes("@")) {
        return (ctx.response.body = {
          user: null,
          error: {
            message: "invalid email address",
            field: "email",
          },
        });
      }

      if (password.trim().length < 5) {
        return (ctx.response.body = {
          user: null,
          error: {
            message: "password must be at least 5 characters long",
            field: "password",
          },
        });
      }

      const hash = await bcrypt.hash(password.trim());

      const exits = await client.execute("SELECT id FROM user WHERE email=?;", [
        email.trim().toLocaleLowerCase(),
      ]);
      if (exits.rows?.length) {
        return (ctx.response.body = {
          user: null,
          error: {
            message: "the email address is already taken.",
            field: "email",
          },
        });
      }
      await client.execute("INSERT INTO user(email, password) VALUES(?, ?);", [
        email.trim().toLocaleLowerCase(),
        hash,
      ]);

      const res = await client.execute(
        "SELECT id, email, created_at, updated_at FROM user WHERE email=?;",
        [email.trim().toLocaleLowerCase()]
      );
      const me: {
        id: number;
        email: string;
        created_at: Date;
        updated_at: Date;
      } | null = res.rows ? res.rows[0] : null;

      if (!me) {
        throw new Error("There's no me!");
      }

      const jwt = await signJwt(me);
      await ctx.cookies.set(__cookieName__, jwt, {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
      });
      return (ctx.response.body = {
        error: null,
        user: me,
      });
    } catch (error) {
      return (ctx.response.body = {
        message: error.message,
        code: 500,
      });
    }
  } else {
    return (ctx.response.body = {
      message: "the request body must be in json format.",
      code: 500,
    });
  }
});
authRouter.post("/logout", (ctx) => {
  return (ctx.response.body = `Logout`);
});

export default new Router().use(
  "/auth",
  authRouter.routes(),
  authRouter.allowedMethods()
);
