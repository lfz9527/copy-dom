import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
// import HoverElement from "../components/hover-element";
import App from "../common/App";
import utils from "@/entrypoints/utils/index";
import "./styles.css";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    utils.doLog("脚本加载成功");
    const comHover = await createShadowUi(ctx);
  },
});

async function createShadowUi(ctx: ContentScriptContext) {
  const hoverMask =  await createShadowRootUi(ctx, {
    name: "jy-copy-dom",
    position: "inline",
    anchor: "body",
    isolateEvents: true,
    onMount(container) {
      const wrapper = document.createElement("div");
      wrapper.id = "app";
      container.append(wrapper);
      const root = ReactDOM.createRoot(wrapper);
      root.render(<App />);

      return { root, wrapper };
    },
    onRemove: (elements) => {
      elements?.root.unmount();
      elements?.wrapper.remove();
    },
  });
  hoverMask.mount();
  return hoverMask
}
 