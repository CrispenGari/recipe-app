import { RouteDataArgs, parseCookie, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { TOKEN_KEY } from "~/constants";
import { MeType, RecipesType } from "~/types";
import Header from "~/components/Header/Header";
import Banner from "~/components/Banner/Banner";
import styles from "./index.module.css";
import { For, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Recipe from "~/components/Recipe/Recipe";
export const routeData = () => {
  return createServerData$(async (_, event) => {
    const cookies = parseCookie(event.request.headers.get("Cookie") ?? "");
    const token = cookies[TOKEN_KEY] ?? "";
    const fetchMe = async () => {
      const res = await event.fetch("http://127.0.0.1:3001/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const { me }: { me: MeType | null } = await res.json();
      return me;
    };
    const fetchRecipes = async () => {
      const res = await event.fetch("http://127.0.0.1:3001/recipes/recipes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const { recipes: _ }: { recipes: Array<RecipesType> } = await res.json();
      return _;
    };
    const [me, recipes] = await Promise.allSettled([fetchMe, fetchRecipes]);
    return {
      me: me.status === "fulfilled" ? await me.value() : null,
      recipes: recipes.status === "fulfilled" ? await recipes.value() : [],
    };
  });
};

export default function Home() {
  const { latest } = useRouteData<typeof routeData>();
  const nav = useNavigate();
  createEffect(async () => {
    if (!!!latest?.me) {
      nav("/auth/login");
    }
  });
  return (
    <div class={styles.home}>
      <Header />
      <Banner />
      <div class={styles.home__recipes}>
        <h1>ALL RECIPES</h1>
        <div class={styles.home__recipes__list}>
          <For each={latest?.recipes || []} fallback={<div>Loading...</div>}>
            {(recipe) => <Recipe recipe={recipe} />}
          </For>
        </div>
      </div>
    </div>
  );
}
