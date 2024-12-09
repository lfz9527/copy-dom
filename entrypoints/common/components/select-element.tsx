import React from "react";
import { getElPosition } from "../utils";
import Mask from "./mask";

interface Prop {
  el: HTMLElement | null;
}

const SelectElement: React.FC<Prop> = ({ el }) => {
  const position = getElPosition(el);

  return (
    <Mask
      post={position}
    />
  );
};

export default SelectElement;
