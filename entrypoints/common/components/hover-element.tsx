import React, { useEffect, useState, useRef } from "react";
import { getElPosition } from "../utils";
import Mask from "./mask";

interface Prop {
  onChange?: (el: HTMLElement) => void;
}

const HoverElement: React.FC<Prop> = ({ onChange }) => {
  const [post, setPost] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  // 添加一个状态来追踪是否启用了光标样式
  const isCursorEnabled = useRef<boolean>(false);
  const [selectDom, setSelectDom] = useState(null);

  useEffect(() => {
    document.addEventListener("mousemove", createHover);
    document.addEventListener("click", clickDom, true);
    toggleCursor();

    return () => {
      document.removeEventListener("mousemove", createHover);
      document.removeEventListener("click", clickDom, true);

      isCursorEnabled.current = true;
      // 在组件卸载时清理样式
      toggleCursor();

      console.log("组件卸载");
    };
  }, []);

  function toggleCursor() {
    if (!isCursorEnabled.current) {
      // 启用光标样式
      document.body.style.cursor = "crosshair";
      // 为所有可能被排除的元素（如按钮等）添加样式
      const style = document.createElement("style");
      style.id = "custom-cursor-style";
      style.textContent = `
          * {
            cursor: crosshair !important;
          }
        `;
      document.head.appendChild(style);
    } else {
      // 移除光标样式
      document.body.style.cursor = "";
      const styleElement = document.getElementById("custom-cursor-style");
      if (styleElement) {
        styleElement.remove();
      }
    }

    isCursorEnabled.current = !isCursorEnabled.current;
  }

  function createHover(e: any) {
    // 获取元素的尺寸和位置信息
    const { width, height, top, left } = getElPosition(e?.target);

    setPost({
      width,
      height,
      top,
      left,
    });
  }

  useEffect(() => {
    if (!isCursorEnabled.current && selectDom) {
      setSelectDom(null);
      onChange && onChange(selectDom);
      toggleCursor();
    }
  }, [selectDom, isCursorEnabled.current]);

  // 在点击事件中使用
  function clickDom(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setSelectDom(e.target);

    // 恢复默认 cursor 值
    toggleCursor();
  }

  return (
    <Mask
      post={post}
    />
  );
};
export default HoverElement;
