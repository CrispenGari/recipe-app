import { component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import Header from "~/components/Header/Header";
import { TOKEN_KEY } from "~/constants";
import type { MeType } from "~/types";

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
export default component$(() => {
  const nav = useNavigate();
  return (
    <div class="home">
      <Header />
      <button onClick$={() => nav("/auth/logout")}>LOGOUT</button>
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
