import React from "react";
import { getElPosition } from "../utils";
import Mask from "./mask";
import "./select.css";

interface Prop {
  el: HTMLElement | null;
  selectParent: () => void;
  selectCurrent: () => void;
  resSelect: () => void;
}

const SelectElement: React.FC<Prop> = ({
  el,
  selectParent,
  selectCurrent,
  resSelect,
}) => {
  const position = getElPosition(el);

  return (
    <>
      <div
        className="tool-content"
        style={{
          top: position.top - 20,
          left: position.left,
        }}
      >
        <div className="tool-item" onClick={selectParent}>
          选择父级节点
        </div>
        <div className="tool-item" onClick={selectCurrent}>
          选择当前节点
        </div>
        <div className="tool-item" onClick={resSelect}>
          重新选择
        </div>
      </div>
      <Mask post={position} />
    </>
  );
};

export default SelectElement;
