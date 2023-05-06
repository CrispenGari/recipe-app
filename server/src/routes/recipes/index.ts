import { Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";
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
