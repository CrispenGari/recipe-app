import { Application } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { oakCors as cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { authRouter, recipesRouter } from "./routes/index.ts";

const app = new Application();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(authRouter.routes());
app.use(recipesRouter.routes());
app.addEventListener(
  "listen",
  ({ port }) => {
    console.log("the server has started at port: " + port.toString());
  },
  {}
);
await app.listen({ port: 3001, secure: false });
