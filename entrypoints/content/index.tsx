import ReactDOM from "react-dom/client";
import React from "react";
import { ContentScriptContext } from "wxt/client";
import HoverElement from "../components/hover-element";
import "./styles.css";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("插件加载~");
    const comHover = await createShadowUi(ctx);
    comHover.mount();
  },
});

function createShadowUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "active-copy-hover",
    position: "inline",
    anchor: "body",
    onMount(container) {
      const wrapper = document.createElement("div");
      container.append(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(<HoverElement />);

      return { root, wrapper };
    },
    onRemove: (elements) => {
      elements?.root.unmount();
      elements?.wrapper.remove();
    },
  });
}
