import { TAB_PLUGIN_ACTIONS } from "~/entrypoints/common/constant/events";
import { sendTabMessage } from "~/entrypoints/common/tabs";

const TabPluginState: Record<
  string,
  {
    load: boolean;
    inject: boolean;
  }
> = {};

export default defineBackground(() => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!TabPluginState[tabId]) {
      TabPluginState[tabId] = {
        load: false,
        inject: false,
      };
    }

    TabPluginState[tabId]["load"] = true;
    TabPluginState[tabId]["inject"] = false;
  });

  // 左键点击图标 (如果有 popup 是不会触发的，可以执行 browser.action.setPopup({ popup: '' }) 来监听事件)
  browser.action.setPopup({ popup: "" });

  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    const { load, inject } = TabPluginState[tab.id];
    if (load) {
      await sendTabMessage({
        msgType: inject
          ? TAB_PLUGIN_ACTIONS.ON_DESTROYED
          : TAB_PLUGIN_ACTIONS.ON_CREATED,
        data: { tabId: tab.id },
      });
      TabPluginState[tab.id].inject = !inject;
    }
  });
});
