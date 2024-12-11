import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
// import HoverElement from "../components/hover-element";
import App from "../common/App";
import utils from "@/entrypoints/utils/index";
import "./styles.css";

interface State {
  load: Record<string, boolean>;
  inject: Record<string, boolean>;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    utils.doLog("脚本加载成功");

    const state: State = {
      load: {},
      inject: {},
    };

    const comHover = await createShadowUi(ctx);
    browser.runtime.onMessage.addListener((message) => {
      const { data } = message;
      const { id } = data;

      if (message.type === "BROWSER_LOAD_COMPLETE") {
        utils.doLog("页面加载完成");
        state.inject[id] = false;
        state.load[id] = false;
      }

      if (message.type === "JY_COPY_DOM_CHANGE") {
        utils.doLog("监听到点击事件");
        const load = state.load[id];

        state.inject[id] = !load
        state.load[id] = !load

        if(load) {
          comHover.remove();
          utils.doLog("插件关闭");
        } else {
          utils.doLog("插件开启");
          comHover.mount();
        }

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
