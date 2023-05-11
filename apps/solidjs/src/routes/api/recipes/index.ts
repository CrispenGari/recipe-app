import { APIEvent, json } from "solid-start";
import { TOKEN_KEY, storage } from "~/constants";
import { RecipesType } from "~/types";

export async function GET({ request, params }: APIEvent) {
  const session = await storage.getSession(request.headers.get("Cookie") ?? "");
  const token = session.get(TOKEN_KEY) ?? "";
  const res = await fetch("http://127.0.0.1:3001/recipes/recipes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  const { recipes }: { recipes: Array<RecipesType> } = await res.json();

  return json(recipes);
}
