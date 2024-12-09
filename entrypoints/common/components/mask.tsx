import React from "react";

interface Prop {
  post: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
  zIndex?: number;
  stroke?: string;
  fill?: string;
}

const Mask: React.FC<Prop> = ({
  post,
  zIndex = 99999,
  stroke = "red",
  fill = "#ffc0cb66",
}) => {
  const { width = 0, height = 0, top = 0, left = 0 } = post;

  return (
    <svg
      id="_hover_svg"
      width={width}
      height={height}
      style={{
        pointerEvents: "none",
        position: "absolute",
        top:top+ 'px',
        left:left + 'px',
        zIndex
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect
        style={{
          stroke,
          fill,
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
export default Mask;
