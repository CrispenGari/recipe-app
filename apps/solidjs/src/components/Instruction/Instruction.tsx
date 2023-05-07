import { Component } from "solid-js";
import styles from "./Instruction.module.css";

interface Props {
  instruction: string;
}

const Instruction: Component<Props> = ({ instruction }) => {
  return (
    <div class={styles.instruction}>
      <p>{instruction}</p>
    </div>
  );
};

export default Instruction;
