import React, { useEffect } from "react";
import { getElPosition } from "../utils";
import { CLICK_DIR } from "../constant/index";
import { ClickDirection, ClickAction } from "~/entrypoints/common/type";
import Mask from "./mask";
import "./select.css";

interface Prop {
  el: HTMLElement | null;
  selectParent: () => void;
  selectCurrent?: () => void;
  resSelect?: () => void;
  onChange: (curEl: HTMLElement) => void;
}

const SelectElement: React.FC<Prop> = ({
  el,
  selectParent,
  onChange,
  selectCurrent,
  resSelect,
}) => {
  const position = getElPosition(el);

  const submit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    onChange && onChange(el!);
  };

  const handleClick = (e: any) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === "jy-copy-dom") return;

    e.preventDefault();
    e.stopPropagation();
    resSelect && resSelect();
  };

  useEffect(() => {
    // 禁用右键菜单并显示自定义内容
    document.addEventListener("contextmenu", submit);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("contextmenu", submit);
      document.removeEventListener("click", handleClick, true);
    };
  }, [el]);

  const handleParent = (e: any) => {
    selectParent();
  };

  return (
    <>
      <div
        className="tool-content"
        style={{
          top: position.top + 4,
          left: position.left + 4,
          zIndex: 1000,
        }}
      >
        <div
          id="select-site-parent-jy"
          className="tool-item"
          onClick={handleParent}
        >
          选择父级节点
        </div>
        {/* <div className="tool-item" onClick={selectCurrent}>
          选择当前节点
        </div>
        <div className="tool-item" onClick={resSelect}>
          重新选择 */}
        {/* </div> */}
      </div>
      <Mask post={position} />
    </>
  );
};

export default SelectElement;
