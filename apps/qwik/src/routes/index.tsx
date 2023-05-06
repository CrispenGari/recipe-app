import {
  component$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import Banner from "~/components/Banner/Banner";
import Header from "~/components/Header/Header";
import { TOKEN_KEY } from "~/constants";
import type { MeType, RecipesType } from "~/types";
import styles from "./index.css?inline";
import Recipe from "~/components/Recipe/Recipe";

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

export const useTokenData = routeLoader$(async (requestContext) => {
  const token = await requestContext.cookie.get(TOKEN_KEY);
  return {
    token: token ? token.value : "",
  };
});
export default component$(() => {
  useStylesScoped$(styles);
  const recipes = useSignal<RecipesType[]>([]);
  const tokenData = useTokenData();

  useVisibleTask$(async () => {
    const token = tokenData.value.token;
    const res = await fetch(`http://127.0.0.1:3001/recipes/recipes`, {
      credentials: "include",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const { recipes: _ }: { recipes: Array<RecipesType> } = await res.json();

    recipes.value = _;
  });

  return (
    <div class="home">
      <Header />
      <Banner />

      <div class="home__recipes">
        <h1>ALL RECIPES</h1>
        <div class="home__recipes__list">
          {recipes.value.map((recipe) => (
            <Recipe key={recipe.name} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Home",
  meta: [
    {
      name: "description",
      content: "Home page",
    },
  ],
};
