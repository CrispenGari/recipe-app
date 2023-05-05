import { Application } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { authRouter } from "./routes/index.ts";

const app = new Application();

(async () => {
  app.use(authRouter.routes());
  await app.listen({ port: 3001, secure: false });
})().then(() => console.log(`The server is running on port: 3001`));
