import { useEffect, useState } from "react";

const HoverElement = () => {
  const [post, setPost] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    document.addEventListener("mousemove", createHover);

    return () => {
      document.removeEventListener("mousemove", createHover);
    };
  }, []);

  function createHover(e: any) {
    // 获取元素的尺寸和位置信息
    const { width, height, top, left } =
      (e?.target as HTMLElement)?.getBoundingClientRect() || {};

    setPost({
      width,
      height,
      top: top + window.screenY,
      left: left + window.screenX,
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        ...post,
        border: "1px solid red",
        zIndex: 99999,
        background: "rgba(0,0,0,0)",
      }}
    ></div>
    // <svg width="200" height="200" viewBox="0 0 200 200">
    //   <rect fill="none" width="100%" height="100%"></rect>
    // </svg>
  );
};
export default HoverElement;
