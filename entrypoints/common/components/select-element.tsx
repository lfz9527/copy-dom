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
  onChange: (curEl:HTMLElement) => void;
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
    console.log('el',el);
    
    onChange && onChange(el!);
  };


  const handleClick = (e:any) =>{
    e.preventDefault();
    e.stopPropagation();
    selectParent()
  }


  useEffect(() => {
    // 禁用右键菜单并显示自定义内容
    document.addEventListener("contextmenu", submit);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("contextmenu", submit);
      document.removeEventListener("click",handleClick, true)
    };
  }, [el]);

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
        <div className="tool-item" onClick={selectParent}>
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
