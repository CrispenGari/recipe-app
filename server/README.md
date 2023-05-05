### server

In this server package we are going to create an API using `deno` that will do the following.

1. authentication

The authentication that we are going to be using here is `cookies` and `jwt`. So the authentication routes will allow users to:

- login `/auth/login` - `POST`
- register `/auth/register` - `POST`
- logout `/auth/logout` - `POST`
- get logged in user `/auth/me` - `GET`

2. serving recipes

This api will allow us to serve some `recipes` from a local json file that is located in the `src/data/recipes.json`. Here are the API endpoint for getting the `recipes` and a single `recipe`.

- recipe `/recipes/recipe/:recipeName` - `GET`
- recipes `/recipes/recipes` - `GET`

> You are only allowed to get the recipes if your are authenticated.

### Building this API

First we will need to create a folder called `src` and create a file called `index.ts` this will be the entrypoint for our `deno` app.

```ts
import { Application } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { oakCors as cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { authRouter, recipesRouter } from "./routes/index.ts";

const app = new Application();
app.use(cors({}));
app.use(authRouter.routes());
app.use(recipesRouter.routes());
await app.listen({ port: 3001, secure: false });
```

In the `index.ts` file we are just creating an `oak` application that will start at port `3001` not that we are using the `app.use()` and add our `routes` as middleware functions.

Then we will need to create a `deno.json` file in the root directory of our `server`. In this file we are going to add a `task` called `start` that will run our `index.ts` as follows

```json
{
  "tasks": {
    "start": "deno run --watch --allow-net --allow-read --allow-env src/index.ts"
  },
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  }
}
```

Now let's create a `.env` file in the root of the `server` and add a `JWT_TOKEN_SECRETE` as an environmental variable that we will use to sign and verify jwt tokens:

```shell
JWT_TOKEN_SECRETE = 'secrete'
```

Let's create our `utils` functions:

1. `signJwt`- allows us to create a `jwt` token from an object.
2. `verifyJwt` - verifies the `jwt` token to return an object.

These functions will be located in the `src/utils/index.ts` file.

```ts
import jwt from "npm:jsonwebtoken@9.0.0";
import { load } from "https://deno.land/std@0.186.0/dotenv/mod.ts";
const env = await load();

export const signJwt = async ({
  id,
  email,
}: {
  email: string;
  id: number;
}): Promise<string> => {
  return await jwt.sign(
    {
      id,
      email,
    },
    env.JWT_TOKEN_SECRETE
  );
};

export const verifyJwt = async (token: string) => {
  return (await jwt.verify(token, env.JWT_TOKEN_SECRETE)) as {
    email: string;
    id: number;
  };
};
```

Now we need a way of storing users in the database. For that we are going to use `mysql` as our database. So make sure that you have `mysql` instance running on your computer. You will need to create a database called `recieps` if you are using `MySQL Command Line Client` you can create it as follows:

```sql
CREATE DATABASE IF NOT EXISTS recieps;
```

Select the database and create a table called `user`

```sql
USE recieps;

-- create table
CREATE TABLE IF NOT EXISTS user(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
```

Now we have a table called `user`. Let's create an instance of `mysql-client` for that we are going to create it in the `/src/mysql/index.ts` file and add the following code in it:

```ts
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

export const client = await new Client().connect({
  hostname: "127.0.0.1",
  username: "root",
  db: "recieps",
  password: "root",
});
```

Now that we have a database `client` we can start working on our `auth` routes. These routes will be located in the `src/routes/auth/index.ts` and here is what the code looks like in this file.

```ts
import { Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";
import { client } from "../../mysql/index.ts";
import { signJwt, verifyJwt } from "../../utils/index.ts";
import { __cookieName__ } from "../../constants/index.ts";
const authRouter = new Router();

authRouter.get("/me", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  try {
    const jwt = await ctx.cookies.get(__cookieName__);
    if (!jwt) {
      ctx.response.status = 200;
      return (ctx.response.body = { me: null });
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
    ctx.response.status = 200;
    return (ctx.response.body = {
      me,
    });
  } catch (error) {
    ctx.response.status = 500;
    return (ctx.response.body = {
      message: error.message,
      code: 500,
    });
  }
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
        ctx.response.status = 200;
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
        ctx.response.status = 200;
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
      ctx.response.status = 200;
      return (ctx.response.body = {
        error: null,
        user: me,
      });
    } catch (error) {
      ctx.response.status = 500;
      return (ctx.response.body = {
        message: error.message,
        code: 500,
      });
    }
  } else {
    ctx.response.status = 500;
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
        ctx.response.status = 200;
        return (ctx.response.body = {
          user: null,
          error: {
            message: "invalid email address",
            field: "email",
          },
        });
      }

      if (password.trim().length < 5) {
        ctx.response.status = 200;
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
        ctx.response.status = 200;
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
      ctx.response.status = 200;
      return (ctx.response.body = {
        error: null,
        user: me,
      });
    } catch (error) {
      ctx.response.status = 500;
      return (ctx.response.body = {
        message: error.message,
        code: 500,
      });
    }
  } else {
    ctx.response.status = 500;
    return (ctx.response.body = {
      message: "the request body must be in json format.",
      code: 500,
    });
  }
});
authRouter.post("/logout", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  await ctx.cookies.delete(__cookieName__);
  return (ctx.response.body = {
    me: null,
  });
});
export default new Router().use(
  "/auth",
  authRouter.routes(),
  authRouter.allowedMethods()
);
```

Next let's work on the `recipes` router which will be located in the `/src/recipes/index.ts` and will have the following code in it:

```ts
import { Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { __cookieName__ } from "../../constants/index.ts";
import { isAuthenticated } from "../../middlewares/index.ts";
import { getQuery } from "https://deno.land/x/oak@v12.4.0/helpers.ts";

const { default: recipes } = await import("../../data/recipes.json", {
  assert: { type: "json" },
});
const recipesRouter = new Router();

recipesRouter.get("/recipes", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  ctx.response.status = 200;
  ctx.response.body = { recipes };
});
recipesRouter.get("/recipe/:recipeName", async (ctx) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  const { recipeName } = (await getQuery(ctx, { mergeParams: true })) as {
    recipeName: string;
  };

  const recipe = recipes.find(
    (r) => r.name.toLowerCase() === recipeName.toLocaleLowerCase()
  );
  ctx.response.status = 200;
  return (ctx.response.body = { recipe });
});

export default new Router()
  .use(isAuthenticated)
  .use("/recipes", recipesRouter.routes(), recipesRouter.allowedMethods());
```

So we are protecting our `recipes` to unauthenticated users using the `isAuthenticated` `middleware` which checks if the user is authenticated or not. This `middleware` is located in the `src/middleware/index.ts` file and it looks as follows:

```ts
import { Middleware } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { verifyJwt } from "../utils/index.ts";
import { client } from "../mysql/index.ts";
import { __cookieName__ } from "../constants/index.ts";

export const isAuthenticated: Middleware = async (ctx, next) => {
  await ctx.response.headers.set("Content-Type", "application/json");
  try {
    const jwt = await ctx.cookies.get(__cookieName__);
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
```

Now if we run the following command to start the server

```shell
deno task start
```

The server will start at a port of `3001`

### References

1. [oak](https://deno.land/x/oak@v12.4.0)
2. [deno.com](https://deno.com/manual@v1.33.1/basics/env_variables)
