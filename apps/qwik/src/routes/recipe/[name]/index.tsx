import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import styles from "./recipe.css?inline";
import Header from "~/components/Header/Header";
import Banner from "~/components/Banner/Banner";
import { TOKEN_KEY } from "~/constants";
import type { MeType, RecipesType } from "~/types";
import { decodeId } from "~/utils";
import Igredient from "~/components/Igredient/Igredient";
import Instruction from "~/components/Instruction/Instruction";

export const onGet: RequestHandler = async (response) => {
  const token = response.cookie.get(TOKEN_KEY);
  const res = await fetch("http://127.0.0.1:3001/auth/me", {
    headers: {
      Authorization: `Bearer ${token?.value ? token.value : ""}`,
    },
    credentials: "include",
  });
  const { me }: { me: MeType | null } = await res.json();
  if (!me) {
    response.redirect(307, "/auth/login");
  }
};

export const useRecipeData = routeLoader$(async (requestContext) => {
  const token = await requestContext.cookie.get(TOKEN_KEY);
  const { name } = (await requestContext.params) as { name: string };
  const res = await fetch(
    `http://127.0.0.1:3001/recipes/recipe/${decodeId(name)}`,
    {
      credentials: "include",
      headers: {
        authorization: `Bearer ${token?.value}`,
      },
    }
  );
  const { recipe }: { recipe: RecipesType } = await res.json();
  return {
    recipe,
  };
});
export default component$(() => {
  useStylesScoped$(styles);

  const recipe = useRecipeData();
  return (
    <div class="recipe">
      <Header />
      <Banner />
      <div class="recipe__recipe">
        <h1>{recipe.value.recipe.name}</h1>
        <img
          src={recipe.value.recipe.imageURL || "/cover.jpg"}
          alt={recipe.value.recipe.name}
        />

        <h2>Ingredients</h2>
        <p>
          Here are the the ingredients that you need to make{" "}
          {recipe.value.recipe.name}.
        </p>
        {recipe.value.recipe.ingredients.map((ingredient, i) => (
          <Igredient key={i} {...ingredient} />
        ))}
        <h2>Steps</h2>
        <p>Steps you need to follow when making {recipe.value.recipe.name}.</p>
        {recipe.value.recipe.steps.map((step, i) => (
          <Instruction key={i} instruction={step} />
        ))}

        <Link href={recipe.value.recipe.originalURL}>READ MORE</Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const { recipe } = resolveValue(useRecipeData);
  return {
    title: recipe.name,
    meta: [
      {
        content: `You are viewing ${recipe.name}.`,
        name: recipe.name,
      },
    ],
  };
};
