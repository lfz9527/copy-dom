import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import App from "../common/App";
import utils from "@/entrypoints/utils/index";
import { TAB_PLUGIN_ACTIONS } from "@/entrypoints/common/constant/events";
import { openEditorCodePage } from "~/entrypoints/common/tabs";   
import "./styles.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    utils.doLog("脚本加载成功");

    const comHover = await createShadowUi(ctx);
    browser.runtime.onMessage.addListener((message) => {
      const {type } = message;
      switch (type) {
        case TAB_PLUGIN_ACTIONS.ON_CREATED:
          utils.doLog("插件开启");
          comHover.mount();
          break;
        case TAB_PLUGIN_ACTIONS.ON_DESTROYED:
          comHover.remove();
          utils.doLog("插件关闭");
          break
        default:
          utils.doLog("组件启动错误");
          break;
      }
    });


  },
});

async function createShadowUi(ctx: ContentScriptContext) {
  const hoverMask = await createShadowRootUi(ctx, {
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
  return hoverMask;
}
