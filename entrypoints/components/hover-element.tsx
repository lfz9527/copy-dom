import { useEffect, useState } from "react";
import * as parse5 from "parse5";
import getStyle from "./style";

const HoverElement = () => {
  const [post, setPost] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  // 添加一个状态来追踪是否启用了光标样式
  const [isCursorEnabled, setIsCursorEnabled] = useState(false);
  const [selectDom, setSelectDom] = useState(null);

  useEffect(() => {
    document.addEventListener("mousemove", createHover);
    document.addEventListener("click", clickDom, true);
    toggleCursor();

    return () => {
      document.removeEventListener("mousemove", createHover);
      document.removeEventListener("click", clickDom, true);

      // 在组件卸载时清理样式
      const styleElement = document.getElementById("custom-cursor-style");
      if (styleElement) {
        styleElement.remove();
      }
      document.body.style.cursor = "";
    };
  }, []);

  function toggleCursor() {
    if (!isCursorEnabled) {
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
    setIsCursorEnabled(!isCursorEnabled);
  }

  function createHover(e: any) {
    // 获取元素的尺寸和位置信息
    const { width, height, top, left } =
      (e?.target as HTMLElement)?.getBoundingClientRect() || {};

    setPost({
      width,
      height,
      top: top + window.scrollY,
      left: left,
    });
  }
  // 在点击事件中使用
  function clickDom(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const targetElement = e.target;
    setSelectDom(targetElement);

    const ast =  getStyle(targetElement)

    console.log('ast',ast)

  }

  return (
    <svg
      id="_hover_svg"
      width={post.width}
      height={post.height}
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: post.top,
        left: post.left,
        zIndex: 99999,
      }}
      viewBox={`0 0 ${post.width} ${post.height}`}
    >
      <rect
        style={{
          stroke: "red",
          fill: "#ffc0cb66",
          strokeWidth: 2,
          strokeOpacity: 1 /* 确保边框不透明 */,
        }}
        fill="none"
        width="100%"
        height="100%"
      ></rect>
    </svg>
  );
};
export default HoverElement;
