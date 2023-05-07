import { Component, For, createEffect } from "solid-js";
import styles from "./recipe.module.css";
import { RouteDataArgs, parseCookie } from "solid-start";
import Banner from "~/components/Banner/Banner";
import Header from "~/components/Header/Header";
// import Igredient from "~/components/Igredient/Igredient";
// import Instruction from "~/components/Instruction/Instruction";
import { createServerData$ } from "solid-start/server";
import { TOKEN_KEY } from "~/constants";
import { MeType, RecipesType } from "~/types";
import {
  A,
  useNavigate,
  useParams,
  useRouteData,
  useSearchParams,
} from "@solidjs/router";
import { useRouteParams } from "solid-start/islands/server-router";
import { decodeId } from "~/utils";
import Igredient from "~/components/Igredient/Igredient";
import Instruction from "~/components/Instruction/Instruction";

export const routeData = ({ params }: RouteDataArgs) => {
  return createServerData$(async (_, event) => {
    const recipeName = await decodeId(params.name);
    console.log({ recipeName });
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
    const fetchRecipe = async () => {
      const res = await event.fetch(
        `http://127.0.0.1:3001/recipe/recipe/${recipeName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const { recipe: _ }: { recipe: RecipesType } = await res.json();
      return _;
    };
    const [me, recipe] = await Promise.allSettled([fetchMe, fetchRecipe]);
    return {
      me: me.status === "fulfilled" ? await me.value() : null,
      recipe: recipe.status === "fulfilled" ? await recipe.value() : null,
    };
  });
};
const Recipe: Component = ({}) => {
  const { latest } = useRouteData<typeof routeData>();
  const nav = useNavigate();
  createEffect(async () => {
    // if (!!!latest?.me) {
    //   nav("/auth/login");
    // }
  });
  return (
    <div class={styles.recipe}>
      <Header />
      <Banner />
      <div class={styles.recipe__recipe}>
        {!latest?.recipe ? (
          <p>No recipe</p>
        ) : (
          <>
            <h1>{latest.recipe.name}</h1>
            <img
              src={latest.recipe.imageURL || "/cover.jpg"}
              alt={latest.recipe.name}
            />

            <h2>Ingredients</h2>
            <p>
              Here are the the ingredients that you need to make{" "}
              {latest.recipe.name}.
            </p>
            <For
              each={latest.recipe.ingredients}
              fallback={<div>Loading...</div>}
            >
              {(item) => <Igredient ingridient={item} />}
            </For>
            <h2>Steps</h2>
            <p>Steps you need to follow when making {latest.recipe.name}.</p>

            <For each={latest.recipe.steps} fallback={<div>Loading...</div>}>
              {(step) => <Instruction instruction={step} />}
            </For>
            <A href={latest.recipe.originalURL}>READ MORE</A>
          </>
        )}
      </div>
    </div>
  );
};

export default Recipe;
