import {
  RouteDataArgs,
  parseCookie,
  useRouteData,
  useServerContext,
} from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { REDIRECT_CODES, TOKEN_KEY, storage } from "~/constants";
import { MeType, RecipesType } from "~/types";
import Header from "~/components/Header/Header";
import Banner from "~/components/Banner/Banner";
import styles from "./index.module.css";
import { For, createEffect, on } from "solid-js";
import Recipe from "~/components/Recipe/Recipe";
import { createStore } from "solid-js/store";
export const routeData = () => {
  return createServerData$(async (_, event) => {
    const session = await storage.getSession(
      event.request.headers.get("Cookie") ?? ""
    );
    const token = session.get(TOKEN_KEY) ?? "";
    const res = await event.fetch("http://127.0.0.1:3001/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    const { me }: { me: MeType | null } = await res.json();
    if (!!!me) {
      return redirect("/auth/login", REDIRECT_CODES.TEMPORARY_REDIRECT);
    }
    return {
      me,
      token,
    };
  });
};

export default function Home() {
  const { latest } = useRouteData<typeof routeData>();
  const [recipes, setRecipes] = createStore<Array<RecipesType>>([]);
  createEffect(async () => {
    const res = await fetch("/api/recipes");
    const recipes = await res.json();
    setRecipes(recipes);
  });

  return (
    <div class={styles.home}>
      <Header />
      <Banner />
      <div class={styles.home__recipes}>
        <h1>ALL RECIPES</h1>
        <div class={styles.home__recipes__list}>
          <For each={recipes || []} fallback={<div>Loading...</div>}>
            {(recipe) => <Recipe recipe={recipe} />}
          </For>
        </div>
      </div>
    </div>
  );
}
