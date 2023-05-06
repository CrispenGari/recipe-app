import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Instruction.css?inline";
export default component$(({ instruction }: { instruction: string }) => {
  useStylesScoped$(styles);
  return (
    <div class="instruction">
      <p>{instruction}</p>
    </div>
  );
});
