import { Application } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { oakCors as cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { authRouter, recipesRouter } from "./routes/index.ts";

const app = new Application();
app.use(cors({}));
app.use(authRouter.routes());
app.use(recipesRouter.routes());
await app.listen({ port: 3001, secure: false });
