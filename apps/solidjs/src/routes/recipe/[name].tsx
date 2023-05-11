import { Component, For, createEffect } from "solid-js";
import styles from "./recipe.module.css";
import { RouteDataArgs } from "solid-start";
import Banner from "~/components/Banner/Banner";
import Header from "~/components/Header/Header";
import { createServerData$, redirect } from "solid-start/server";
import { REDIRECT_CODES, TOKEN_KEY, storage } from "~/constants";
import { MeType, RecipesType } from "~/types";
import { A, useParams, useRouteData } from "@solidjs/router";
import { decodeId } from "~/utils";
import Igredient from "~/components/Igredient/Igredient";
import Instruction from "~/components/Instruction/Instruction";
import { createStore } from "solid-js/store";

export const routeData = ({ params }: RouteDataArgs) => {
  const recipeName = decodeId(params.name);
  return createServerData$(
    async ([recipeName], event) => {
      const session = await storage.getSession(
        event.request.headers.get("Cookie") ?? ""
      );
      const token = session.get(TOKEN_KEY) ?? "";
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
      const fetchRecipe = async () => {
        const res = await event.fetch(
          `http://127.0.0.1:3001/recipes/recipe/${recipeName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        const { recipe }: { recipe: RecipesType } = await res.json();
        return recipe;
      };
      const [me, recipe] = await Promise.allSettled([fetchMe, fetchRecipe]);
      const _me = me.status === "fulfilled" ? await me.value() : null;

      const _recipe =
        recipe.status === "fulfilled" ? await recipe.value() : null;

      if (!!!_me) {
        return redirect("/auth/login", REDIRECT_CODES.TEMPORARY_REDIRECT);
      }
      return {
        me: _me,
        recipe: _recipe,
      };
    },
    {
      key: () => [recipeName],
    }
  );
};
const Recipe: Component = ({}) => {
  const { latest } = useRouteData<typeof routeData>();
  const params = useParams();
  const [recipe, setRecipe] = createStore<RecipesType | {}>({});
  createEffect(async () => {
    const res = await fetch(`/api/recipe/${params.name}`);
    const recipe = await res.json();
    setRecipe(recipe);
  });
  return (
    <div class={styles.recipe}>
      <Header />
      <Banner />
      <div class={styles.recipe__recipe}>
        {!Object.keys(recipe).length ? (
          <p>No recipe</p>
        ) : (
          <>
            <h1>{(recipe as RecipesType).name}</h1>
            <img
              src={(recipe as RecipesType)?.imageURL || "/cover.jpg"}
              alt={(recipe as RecipesType).name}
            />

            <h2>Ingredients</h2>
            <p>
              Here are the the ingredients that you need to make{" "}
              {(recipe as RecipesType).name}.
            </p>
            <For
              each={(recipe as RecipesType).ingredients}
              fallback={<div>Loading...</div>}
            >
              {(item) => <Igredient ingridient={item} />}
            </For>
            <h2>Steps</h2>
            <p>
              Steps you need to follow when making{" "}
              {(recipe as RecipesType).name}.
            </p>

            <For
              each={(recipe as RecipesType).steps}
              fallback={<div>Loading...</div>}
            >
              {(step) => <Instruction instruction={step} />}
            </For>
            <A href={(recipe as RecipesType).originalURL}>READ MORE</A>
          </>
        )}
      </div>
    </div>
  );
};

export default Recipe;
