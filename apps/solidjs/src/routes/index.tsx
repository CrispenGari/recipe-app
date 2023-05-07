import { redirect } from "solid-start/api";
import { RouteDataArgs, parseCookie } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { REDIRECT_CODES, TOKEN_KEY } from "~/constants";
import { MeType } from "~/types";
import Header from "~/components/Header/Header";
import Banner from "~/components/Banner/Banner";
import styles from "./index.module.css";

// export const routeData = ({}: RouteDataArgs) => {
//   return createServerData$(
//     async (_, event) => {
//       const cookies = parseCookie(event.request.headers.get("Cookie") ?? "");
//       const token = cookies[TOKEN_KEY] ?? "";
//       const res = await event.fetch("http://127.0.0.1:3001/auth/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });
//       const { me }: { me: MeType | null } = await res.json();
//       if (!!!me) {
//         return redirect("/auth/login", REDIRECT_CODES.TEMPORARY_REDIRECT);
//       }
//       return {
//         me,
//       };
//     },
//     { key: null }
//   );
// };

export default function Home() {
  return (
    <div class={styles.home}>
      <Header />
      <Banner />

      <div class={styles.home__recipes}>
        <h1>ALL RECIPES</h1>
        {/* <div class="home__recipes__list">
          {recipes.value.map((recipe) => (
            <Recipe key={recipe.name} recipe={recipe} />
          ))}
        </div> */}
      </div>
    </div>
  );
}
